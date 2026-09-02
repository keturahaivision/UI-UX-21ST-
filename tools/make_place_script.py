#!/usr/bin/env python3
"""Generate a self-contained AutoLISP script that places a coordinate callout
at every point in a CSV.

    python3 tools/make_place_script.py data/gate_valve_coordinates.csv -o GV_PLACE.lsp

The coordinates are written into the script itself, so the only thing it does
in AutoCAD is insert a block and fill two attributes per point. Nothing is
scanned, no file is read, no settings are stored -- which is the point: when a
larger tool misbehaves, this has almost nothing left to go wrong.
"""

from __future__ import annotations

import argparse
import csv
import datetime as _dt
import sys

TEMPLATE = '''\
;;; ==========================================================================
;;;  {out_name} -- place coordinate callouts at {count} points
;;;  Generated {stamp} from {source}
;;;
;;;  Load with APPLOAD, then type:  GVPLACEPOINTS
;;; ==========================================================================

(vl-load-com)

;; ---- edit these if needed -------------------------------------------------

(setq *GV-BLOCK* "{block}")     ; attributed callout block
(setq *GV-SCALE* {scale})       ; its insertion scale
(setq *GV-ROT*   {rot})         ; its rotation, degrees
(setq *GV-PREC*  {prec})        ; decimal places in the attribute text
(setq *GV-LABEL* {label})       ; T to also write the point name as text
(setq *GV-LAYER* "{lbl_layer}") ; layer for that text
(setq *GV-HT*    {txtht})       ; its height
(setq *GV-DX*    {lbldx})       ; where it sits relative to the point
(setq *GV-DY*    {lbldy})

;; Leave these at 0 when the drawing is modelled on the survey grid. Set them
;; when the drawing sits in a local system, so E/N land in the right place.
(setq *GV-OFFE*  0.0)
(setq *GV-OFFN*  0.0)

;; ---- the coordinates ------------------------------------------------------

(setq *GV-POINTS* '(
{points}
))

;; ---- the work -------------------------------------------------------------

(defun gvp:attribs (e / out nx)
  "The ATTRIB entities belonging to an INSERT."
  (setq out nil nx (entnext e))
  (while (and nx (= "ATTRIB" (cdr (assoc 0 (entget nx)))))
    (setq out (cons nx out) nx (entnext nx)))
  (reverse out))

(defun gvp:place (name ex ny / p ns es obj a d tag)
  "Insert the callout at (ex ny) and write the coordinates into its attributes."
  (setq p  (list (+ ex *GV-OFFE*) (+ ny *GV-OFFN*) 0.0)
        ns (strcat "N=" (rtos ny 2 *GV-PREC*))
        es (strcat "E=" (rtos ex 2 *GV-PREC*)))
  ;; _non defeats running osnap, which would otherwise pull the block onto
  ;; whatever happens to lie near the point
  (command "._-INSERT" *GV-BLOCK* "_non" p *GV-SCALE* *GV-SCALE* *GV-ROT*)
  (setq obj (entlast))
  (foreach a (gvp:attribs obj)
    (setq d (entget a) tag (strcase (cdr (assoc 2 d))))
    (cond
      ((wcmatch tag "Y*,N*") (entmod (subst (cons 1 ns) (assoc 1 d) d)))
      ((wcmatch tag "X*,E*") (entmod (subst (cons 1 es) (assoc 1 d) d)))))
  (entupd obj)
  (if *GV-LABEL*
    (progn
      (if (not (tblsearch "LAYER" *GV-LAYER*))
        (entmakex (list '(0 . "LAYER") '(100 . "AcDbSymbolTableRecord")
                        '(100 . "AcDbLayerTableRecord") (cons 2 *GV-LAYER*)
                        '(70 . 0) '(62 . 7) (cons 6 "Continuous"))))
      (entmakex (list '(0 . "TEXT") '(100 . "AcDbEntity")
                      (cons 8 *GV-LAYER*) '(100 . "AcDbText")
                      (cons 10 (list (+ (car p) *GV-DX*) (+ (cadr p) *GV-DY*) 0.0))
                      (cons 40 *GV-HT*) (cons 1 name) '(50 . 0.0)))))
  obj)

(defun c:GVPLACEPOINTS ( / olde oldd oldc oldo n item)
  (if (not (tblsearch "BLOCK" *GV-BLOCK*))
    (progn
      (princ (strcat "\\nBlock \\"" *GV-BLOCK* "\\" is not in this drawing."))
      (princ "\\nInsert one copy of it first, then run this again."))
    (progn
      (setq olde (getvar "ATTREQ") oldd (getvar "ATTDIA")
            oldc (getvar "CMDECHO") oldo (getvar "OSMODE"))
      (setvar "ATTREQ" 0) (setvar "ATTDIA" 0)
      (setvar "CMDECHO" 0) (setvar "OSMODE" 0)
      (command "._UNDO" "_BEGIN")
      (setq n 0)
      (foreach item *GV-POINTS*
        (gvp:place (car item) (cadr item) (caddr item))
        (setq n (1+ n)))
      (command "._UNDO" "_END")
      (setvar "ATTREQ" olde) (setvar "ATTDIA" oldd)
      (setvar "CMDECHO" oldc) (setvar "OSMODE" oldo)
      (princ (strcat "\\nPlaced " (itoa n) " callout(s) using \\"" *GV-BLOCK* "\\"."))
      (princ "\\nOne UNDO reverses the whole run.")))
  (princ))

(princ (strcat "\\n{out_name} loaded -- {count} points ready.  Type GVPLACEPOINTS"))
(princ)
'''


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", help="CSV with POINTS / EASTING / NORTHING columns")
    ap.add_argument("-o", "--output", default="GV_PLACE.lsp")
    ap.add_argument("--block", default="COOR XY")
    ap.add_argument("--scale", type=float, default=1.608006)
    ap.add_argument("--rotation", type=float, default=0.0)
    ap.add_argument("--precision", type=int, default=3)
    ap.add_argument("--label", action="store_true",
                    help="also write each point name as text")
    ap.add_argument("--label-layer", default="Text-Number")
    ap.add_argument("--text-height", type=float, default=1.5)
    ap.add_argument("--label-dx", type=float, default=0.340)
    ap.add_argument("--label-dy", type=float, default=-3.906)
    args = ap.parse_args(argv)

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
            if not name:
                skipped.append((lineno, "no point name"))
                continue
            rows.append((name, e, n))

    # dropping rows silently is how a list quietly comes up short
    for lineno, why in skipped:
        print(f"  skipped line {lineno}: {why}", file=sys.stderr)

    if not rows:
        print("no usable rows — expected POINTS / EASTING / NORTHING columns",
              file=sys.stderr)
        return 1

    p = args.precision

    def lisp_str(text: str) -> str:
        """AutoLISP string literal. Backslash and quote both need escaping —
        unescaped, a quote ends the string early and breaks the whole file."""
        return '"' + text.replace("\\", "\\\\").replace('"', '\\"') + '"'

    quoted = [(lisp_str(name), e, n) for name, e, n in rows]
    width = max(len(q[0]) for q in quoted) + 1
    points = "\n".join(f"  ({q:<{width}} {e:.{p}f} {n:.{p}f})" for q, e, n in quoted)

    out_name = args.output.replace("\\", "/").rsplit("/", 1)[-1]
    text = TEMPLATE.format(
        out_name=out_name,
        count=len(rows),
        stamp=_dt.date.today().isoformat(),
        source=args.csv.replace("\\", "/").rsplit("/", 1)[-1],
        block=args.block,
        scale=f"{args.scale:.6f}",
        rot=f"{args.rotation:.4f}",
        prec=p,
        label="T" if args.label else "nil",
        lbl_layer=args.label_layer,
        txtht=f"{args.text_height:.3f}",
        lbldx=f"{args.label_dx:.3f}",
        lbldy=f"{args.label_dy:.3f}",
        points=points,
    )
    with open(args.output, "w", encoding="utf-8") as fh:
        fh.write(text)
    print(f"wrote {args.output} — {len(rows)} points"
          + (f", {len(skipped)} row(s) skipped" if skipped else ""), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
