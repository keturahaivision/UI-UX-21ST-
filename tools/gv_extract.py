#!/usr/bin/env python3
"""Extract gate-valve (GV) points and their survey coordinates from an AutoCAD drawing.

Two readers are supported:

  * DXF  -- via ezdxf. This is the normal path: SAVEAS/DXFOUT from AutoCAD, or
            convert a DWG with `dwg2dxf` (LibreDWG) / ODA File Converter.
  * JSON -- via `dwgread -O JSON file.dwg`. Useful for large DWGs where the
            DXF writer bails out part way through but the object reader is fine.

The extractor finds every insert of the gate-valve block, pairs each one with its
`GV<n>` label text, auto-numbers any valve that has no label, and writes a CSV
list of POINTS / EASTING / NORTHING.

Usage
-----
    python3 gv_extract.py drawing.dxf -o gate_valve_coordinates.csv
    python3 gv_extract.py drawing.json --block "*CI_PW_GV*" --layer PW_GV
    python3 gv_extract.py part.dxf --offset-e 508213.7388 --offset-n 2741920.1623

The `--offset-*` / `--rotation` / `--scale` options apply a similarity transform
from drawing WCS to the survey grid, for drawings that were pasted into a local
coordinate system rather than modelled on the grid.
"""

from __future__ import annotations

import argparse
import csv
import fnmatch
import json
import math
import re
import statistics
import sys
from dataclasses import dataclass, field

LABEL_RE = re.compile(r"^\s*GV\s*[-_]?\s*(\d+)\s*$", re.IGNORECASE)

DEFAULT_BLOCK_PATTERNS = ["*CI_PW_GV*", "*PW_GV*", "*GATE*VALVE*", "*_GV", "GV"]
DEFAULT_BLOCK_LAYERS = ["PW_GV", "*_PW_GV", "*GATE*VALVE*"]
DEFAULT_LABEL_LAYERS = ["*"]


@dataclass
class Insert:
    x: float
    y: float
    layer: str
    block: str
    rotation: float = 0.0


@dataclass
class Label:
    number: int
    x: float
    y: float
    layer: str
    rotation: float = 0.0


@dataclass
class Point:
    """One resolved gate-valve point."""

    number: int
    easting: float
    northing: float
    labelled: bool = True
    warnings: list[str] = field(default_factory=list)

    @property
    def name(self) -> str:
        return f"GV{self.number}"


class Transform:
    """Similarity transform from drawing WCS to the survey grid."""

    def __init__(self, offset_e=0.0, offset_n=0.0, rotation_deg=0.0, scale=1.0,
                 base_x=0.0, base_y=0.0):
        self.offset_e = offset_e
        self.offset_n = offset_n
        self.rotation = math.radians(rotation_deg)
        self.scale = scale
        self.base_x = base_x
        self.base_y = base_y

    @property
    def identity(self) -> bool:
        return (self.offset_e == 0.0 and self.offset_n == 0.0
                and self.rotation == 0.0 and self.scale == 1.0)

    def apply(self, x: float, y: float) -> tuple[float, float]:
        dx, dy = x - self.base_x, y - self.base_y
        c, s = math.cos(self.rotation), math.sin(self.rotation)
        rx = (dx * c - dy * s) * self.scale
        ry = (dx * s + dy * c) * self.scale
        return rx + self.base_x + self.offset_e, ry + self.base_y + self.offset_n


def matches_any(name: str, patterns: list[str]) -> bool:
    """Case-insensitive glob match, also matching the part after an xref `$0$` prefix."""
    if not name:
        return False
    low = name.lower()
    bare = low.rsplit("$", 1)[-1]
    return any(fnmatch.fnmatch(low, p.lower()) or fnmatch.fnmatch(bare, p.lower())
               for p in patterns)


# --------------------------------------------------------------------------- readers

def read_dxf(path: str) -> tuple[list[Insert], list[Label]]:
    try:
        import ezdxf
        from ezdxf import recover
    except ImportError:  # pragma: no cover
        sys.exit("ezdxf is required to read DXF files:  pip install ezdxf")

    try:
        doc = ezdxf.readfile(path)
    except Exception:
        doc, _auditor = recover.readfile(path)

    inserts, labels = [], []
    for space in [doc.modelspace()]:
        for e in space.query("INSERT"):
            inserts.append(Insert(
                x=float(e.dxf.insert.x), y=float(e.dxf.insert.y),
                layer=str(e.dxf.layer), block=str(e.dxf.name),
                rotation=math.radians(float(getattr(e.dxf, "rotation", 0.0) or 0.0)),
            ))
        for e in space.query("TEXT MTEXT"):
            raw = e.dxf.text if e.dxftype() == "TEXT" else e.text
            m = LABEL_RE.match(strip_mtext(str(raw)))
            if not m:
                continue
            p = e.dxf.insert
            labels.append(Label(
                number=int(m.group(1)), x=float(p.x), y=float(p.y),
                layer=str(e.dxf.layer),
                rotation=math.radians(float(getattr(e.dxf, "rotation", 0.0) or 0.0)),
            ))
    return inserts, labels


def strip_mtext(s: str) -> str:
    """Remove the common MTEXT formatting codes so `\\A1;GV12` still matches."""
    s = re.sub(r"\\[A-Za-z][^;\\]*;", "", s)
    s = s.replace("\\P", " ").replace("{", "").replace("}", "")
    return s.strip()


def read_libredwg_json(path: str) -> tuple[list[Insert], list[Label]]:
    """Read `dwgread -O JSON` output.

    Handle references are encoded as lists whose LAST element is the handle,
    e.g. `[5, 3, 14201, 14201]` -- earlier elements are the reference code.
    """
    with open(path, encoding="utf-8", errors="replace") as fh:
        data = json.load(fh)
    objs = data["OBJECTS"]

    def handle_of(obj):
        h = obj.get("handle")
        return h[-1] if isinstance(h, list) else h

    def ref(value):
        return value[-1] if isinstance(value, list) and value else None

    layer_names, block_names = {}, {}
    model_space_handles = set()
    for o in objs:
        if o.get("object") == "LAYER":
            layer_names[handle_of(o)] = o.get("name") or ""
        elif o.get("object") == "BLOCK_HEADER":
            name = o.get("name") or ""
            block_names[handle_of(o)] = name
            if name.upper().lstrip("*").startswith("MODEL_SPACE"):
                model_space_handles.add(handle_of(o))

    def in_model_space(obj) -> bool:
        """Skip entities that live inside a block definition (legends, table blocks).

        LibreDWG rarely fills in `ownerhandle` for entities, but `entmode` is
        reliable: 2 = model space, 1 = paper space, 0 = owned by a block.
        """
        mode = obj.get("entmode")
        if mode is not None:
            return mode == 2
        if not model_space_handles:
            return True
        return ref(obj.get("ownerhandle")) in model_space_handles

    inserts, labels = [], []
    for o in objs:
        if not in_model_space(o):
            continue
        kind = o.get("entity")
        if kind == "INSERT":
            p = o.get("ins_pt")
            if not p:
                continue
            inserts.append(Insert(
                x=float(p[0]), y=float(p[1]),
                layer=layer_names.get(ref(o.get("layer")), ""),
                block=block_names.get(ref(o.get("block_header")), ""),
                rotation=float(o.get("rotation") or 0.0),
            ))
        elif kind in ("TEXT", "MTEXT"):
            raw = o.get("text_value") or o.get("text") or ""
            if not isinstance(raw, str):
                continue
            m = LABEL_RE.match(strip_mtext(raw))
            p = o.get("ins_pt")
            if not m or not p:
                continue
            labels.append(Label(
                number=int(m.group(1)), x=float(p[0]), y=float(p[1]),
                layer=layer_names.get(ref(o.get("layer")), ""),
                rotation=float(o.get("rotation") or 0.0),
            ))
    return inserts, labels


# --------------------------------------------------------------------------- pairing

def local_offset(label: Label, ins: Insert) -> tuple[float, float]:
    """Label->valve offset expressed in the label's own rotated frame.

    Labels are placed at a repeatable offset from the symbol, so in the label
    frame every pair lands in the same small cluster. That makes the offset a
    strong prior for disambiguating valves that sit close together.
    """
    dx, dy = ins.x - label.x, ins.y - label.y
    c, s = math.cos(-label.rotation), math.sin(-label.rotation)
    return dx * c - dy * s, dx * s + dy * c


def _greedy(inserts, labels, max_dist, score):
    """Assign labels to valves, best score first; each is used at most once."""
    cands = []
    for li, lab in enumerate(labels):
        for ii, ins in enumerate(inserts):
            if math.hypot(ins.x - lab.x, ins.y - lab.y) <= max_dist:
                cands.append((score(lab, ins), li, ii))
    cands.sort()
    label_to_insert: dict[int, int] = {}
    taken: set[int] = set()
    for _s, li, ii in cands:
        if li in label_to_insert or ii in taken:
            continue
        label_to_insert[li] = ii
        taken.add(ii)
    return label_to_insert


def pair_labels(inserts: list[Insert], labels: list[Label], max_dist: float):
    """Two-pass assignment of GV labels to valve symbols.

    Pass 1 matches on plain distance, only to learn the drawing's typical
    label offset. Pass 2 rematches against that offset, which is what separates
    valves sitting a few metres apart -- distance alone swaps their labels.
    """
    first = _greedy(inserts, labels, max_dist,
                    lambda lab, ins: math.hypot(ins.x - lab.x, ins.y - lab.y))
    if not first:
        return first

    offsets = [local_offset(labels[li], inserts[ii]) for li, ii in first.items()]
    mx = statistics.median(o[0] for o in offsets)
    my = statistics.median(o[1] for o in offsets)

    def prior(lab, ins):
        ox, oy = local_offset(lab, ins)
        return math.hypot(ox - mx, oy - my)

    return _greedy(inserts, labels, max_dist, prior)


def build_points(inserts, labels, transform: Transform, max_dist: float,
                 renumber: bool) -> tuple[list[Point], list[str]]:
    notes: list[str] = []
    mapping = pair_labels(inserts, labels, max_dist)

    used_inserts = set(mapping.values())
    by_number: dict[int, list[int]] = {}
    for li, ii in mapping.items():
        by_number.setdefault(labels[li].number, []).append(ii)

    points: list[Point] = []
    for number, iis in sorted(by_number.items()):
        for k, ii in enumerate(iis):
            e, n = transform.apply(inserts[ii].x, inserts[ii].y)
            p = Point(number=number, easting=e, northing=n)
            if k:
                p.warnings.append(f"duplicate label GV{number}")
                notes.append(f"GV{number}: label used more than once")
            points.append(p)

    unlabelled = [i for i in range(len(inserts)) if i not in used_inserts]
    if unlabelled:
        notes.append(f"{len(unlabelled)} valve(s) carry no GV label")
    next_number = (max(by_number) if by_number else 0) + 1
    for ii in unlabelled:
        e, n = transform.apply(inserts[ii].x, inserts[ii].y)
        if renumber:
            p = Point(number=next_number, easting=e, northing=n, labelled=False)
            p.warnings.append("auto-numbered (no GV label in drawing)")
            next_number += 1
        else:
            p = Point(number=0, easting=e, northing=n, labelled=False)
            p.warnings.append("unlabelled valve")
        points.append(p)

    missing = [i for i in range(1, max(by_number, default=0) + 1) if i not in by_number]
    if missing:
        notes.append("gaps in GV numbering: " + ", ".join(f"GV{i}" for i in missing))

    points.sort(key=lambda p: (p.number == 0, p.number))
    return points, notes


# --------------------------------------------------------------------------- output

def write_csv(points: list[Point], path: str, precision: int) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["POINTS", "EASTING", "NORTHING", "REMARKS"])
        for p in points:
            w.writerow([
                p.name if p.number else "(unnumbered)",
                f"{p.easting:.{precision}f}",
                f"{p.northing:.{precision}f}",
                "; ".join(p.warnings),
            ])


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("drawing", help="input .dxf, or dwgread JSON (.json)")
    ap.add_argument("-o", "--output", default="gate_valve_coordinates.csv")
    ap.add_argument("--block", action="append", dest="blocks",
                    help="block-name glob for the valve symbol (repeatable)")
    ap.add_argument("--layer", action="append", dest="layers",
                    help="layer glob for the valve symbol (repeatable)")
    ap.add_argument("--label-layer", action="append", dest="label_layers",
                    help="layer glob for the GV label text (repeatable)")
    ap.add_argument("--max-dist", type=float, default=25.0,
                    help="furthest a GV label may sit from its valve (drawing units)")
    ap.add_argument("--precision", type=int, default=3)
    ap.add_argument("--no-renumber", action="store_true",
                    help="leave unlabelled valves unnumbered instead of continuing the sequence")
    ap.add_argument("--offset-e", type=float, default=0.0)
    ap.add_argument("--offset-n", type=float, default=0.0)
    ap.add_argument("--rotation", type=float, default=0.0, help="degrees, counter-clockwise")
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--json-out", help="also write the points as JSON")
    args = ap.parse_args(argv)

    if args.drawing.lower().endswith(".json"):
        inserts, labels = read_libredwg_json(args.drawing)
    else:
        inserts, labels = read_dxf(args.drawing)

    blocks = args.blocks or DEFAULT_BLOCK_PATTERNS
    layers = args.layers or DEFAULT_BLOCK_LAYERS
    label_layers = args.label_layers or DEFAULT_LABEL_LAYERS

    valves = [i for i in inserts
              if matches_any(i.block, blocks) or matches_any(i.layer, layers)]
    labels = [l for l in labels if matches_any(l.layer, label_layers)]

    print(f"read {len(inserts)} inserts, {len(valves)} gate-valve symbols, "
          f"{len(labels)} GV labels", file=sys.stderr)
    if not valves:
        print("no gate-valve symbols matched -- check --block / --layer", file=sys.stderr)
        return 1

    transform = Transform(args.offset_e, args.offset_n, args.rotation, args.scale)
    points, notes = build_points(valves, labels, transform, args.max_dist,
                                 renumber=not args.no_renumber)

    write_csv(points, args.output, args.precision)
    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as fh:
            json.dump([{"point": p.name if p.number else None,
                        "easting": round(p.easting, args.precision),
                        "northing": round(p.northing, args.precision),
                        "remarks": p.warnings} for p in points], fh, indent=2)

    print(f"wrote {len(points)} points to {args.output}", file=sys.stderr)
    for note in notes:
        print(f"  note: {note}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
