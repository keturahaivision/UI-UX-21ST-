#!/usr/bin/env python3
"""Generate an AutoCAD SCRIPT (.scr) that inserts a coordinate callout block at
every point in a CSV, with its attributes already filled in.

    python3 tools/make_insert_script.py data/gate_valve_coordinates.csv -o GV_PLACE.scr

A .scr is plain AutoCAD command input -- no AutoLISP, no APPLOAD, no trusted
folder to configure. It runs with SCRIPT.

Two things a script file cannot do, which shape the output:

  * A space in a script is an Enter. A block name containing one therefore has
    to be renamed first (RENAME -> Block), which --block reflects.
  * Attribute values are answered in the order the block prompts for them, so
    --attr-order must match the block's own attribute order. Get it wrong and
    the northing lands in the easting box -- visible immediately, and fixed by
    regenerating with a different order.

Typed coordinates are exact regardless of running object snap, so the script
leaves OSMODE alone.
"""

from __future__ import annotations

import argparse
import csv
import datetime as _dt
import sys


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", help="CSV with POINTS / EASTING / NORTHING columns")
    ap.add_argument("-o", "--output", default="GV_PLACE.scr")
    ap.add_argument("--block", default="COORXY",
                    help="block name — must contain no spaces (default: COORXY)")
    ap.add_argument("--scale", type=float, default=1.608006)
    ap.add_argument("--rotation", type=float, default=0.0)
    ap.add_argument("--precision", type=int, default=3)
    ap.add_argument("--offset-e", type=float, default=0.0,
                    help="added to every easting before insertion — set this when the "
                         "target drawing sits in a local coordinate system rather than "
                         "on the survey grid")
    ap.add_argument("--offset-n", type=float, default=0.0,
                    help="added to every northing before insertion")
    ap.add_argument("--attr-order", default="N,E,N,E",
                    help="the block's attribute prompt order, N for northing and "
                         "E for easting (default: N,E,N,E for Y1,X1,Y2,X2)")
    args = ap.parse_args(argv)

    if " " in args.block:
        print(f"block name {args.block!r} contains a space — a script would read "
              f"that as Enter. Rename the block in AutoCAD first.", file=sys.stderr)
        return 1

    order = [t.strip().upper() for t in args.attr_order.split(",") if t.strip()]
    if not order or any(t not in ("N", "E") for t in order):
        print("--attr-order must be a comma-separated list of N and E", file=sys.stderr)
        return 1

    rows, skipped = [], []
    with open(args.csv, newline="", encoding="utf-8-sig") as fh:
        for lineno, r in enumerate(csv.DictReader(fh), start=2):
            keys = {k.strip().upper(): k for k in r if k}
            try:
                name = (r[keys["POINTS"]] or "").strip()
                e = float(r[keys["EASTING"]])
                n = float(r[keys["NORTHING"]])
            except KeyError:
                skipped.append((lineno, "missing a POINTS/EASTING/NORTHING column"))
                continue
            except (ValueError, TypeError):
                skipped.append((lineno, "easting or northing is not a number"))
                continue
            rows.append((name or f"row{lineno}", e, n))

    for lineno, why in skipped:
        print(f"  skipped line {lineno}: {why}", file=sys.stderr)
    if not rows:
        print("no usable rows", file=sys.stderr)
        return 1

    p = args.precision
    out = [
        f"; {args.output.rsplit('/', 1)[-1]} - place {len(rows)} coordinate callouts",
        f"; generated {_dt.date.today().isoformat()} from {args.csv.rsplit('/', 1)[-1]}",
        f"; block {args.block}, scale {args.scale:.6f}, attribute order {','.join(order)}",
        (f"; insertion offset E{args.offset_e:+.5f} N{args.offset_n:+.5f}"
         if (args.offset_e or args.offset_n)
         else "; no insertion offset — the drawing must be on the survey grid"),
        ";",
        "; In AutoCAD:  SCRIPT  ->  pick this file.  One U undoes the whole run.",
        ";",
        "CMDECHO",
        "0",
        "ATTDIA",
        "0",
        "ATTREQ",
        "1",
        "UNDO",
        "BE",
    ]
    for name, e, n in rows:
        # the text always states the survey coordinate; only where the block is
        # placed shifts, so a local-system drawing still gets correct callouts
        ns, es = f"N={n:.{p}f}", f"E={e:.{p}f}"
        ix, iy = e + args.offset_e, n + args.offset_n
        out += [
            f"; {name}",
            "-INSERT",
            args.block,
            f"{ix:.{p}f},{iy:.{p}f}",
            f"{args.scale:.6f}",
            f"{args.scale:.6f}",
            f"{args.rotation:.4f}",
        ]
        out += [ns if t == "N" else es for t in order]
    out += ["UNDO", "E", "CMDECHO", "1", ""]

    # a script is newline-driven: every line is an Enter, so CRLF and a final
    # newline both matter
    with open(args.output, "w", encoding="utf-8", newline="\r\n") as fh:
        fh.write("\n".join(out))

    print(f"wrote {args.output} — {len(rows)} callouts"
          + (f", {len(skipped)} row(s) skipped" if skipped else ""), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
