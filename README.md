# GV Point List — automatic gate-valve coordinate lists for AutoCAD

Tools for picking gate-valve (GV) points out of an AutoCAD / Civil 3D water
drawing and turning them into a numbered coordinate list — on screen, as a
drawing table, and as CSV.

Built against the NOC water drawings (`25_114D_NOC_WAT_13.0_RevF.dwg`), where
gate valves are inserts of block `CI_PW_GVN_PROP` on layer `PW_GV`, labelled
with 1.5-unit text `GV1`, `GV2`, … and listed in a **GATE VALVE COORDINATES**
table of POINTS / EASTING / NORTHING.

| | |
|---|---|
| `lisp/GVLIST.lsp` | the AutoCAD tool — click a valve, or scan the whole drawing |
| `tools/gv_extract.py` | the same extraction offline, from DXF or DWG, without AutoCAD |
| `data/gate_valve_coordinates.csv` | the 174 points generated from the supplied drawing |
| `docs/drawing-review.md` | what the automated pass found in the existing manual table |

---

## The AutoCAD tool

### Install

Put `GVLIST.lsp` somewhere on the AutoCAD support path and load it with
`APPLOAD`. Add it to the *Startup Suite* if you want it in every drawing.
It loads with:

```
GV point list loaded.  Commands: GVPICK  GVLIST  GVTABLE  GVCSV  GVSETUP  GVLABEL
```

### Commands

| Command | What it does |
|---|---|
| **GVPICK** | Click one gate valve (or any point) — reports its Easting & Northing, gives it the next number in the sequence, and offers to place the `GV<n>` label and the `N=` / `E=` callout |
| **GVLIST** | Select valves, or press Enter to scan the whole drawing. Finds every valve, pairs each with its `GV<n>` label, auto-numbers any that have none, and prints the full list |
| **GVTABLE** | Draws the **GATE VALVE COORDINATES** table from the current list at a picked point |
| **GVCSV** | Writes the current list to a CSV file |
| **GVSETUP** | Review and change the settings (below). Stored in the drawing, so they travel with the DWG |
| **GVLABEL** | Place an `N=` / `E=` coordinate callout at any picked point |
| **GVAUDIT** | Check the drawing's **GATE VALVE COORDINATES** table against the valve positions and report any row whose label disagrees. Reports only — changes nothing |
| **GVFIXTABLE** | The same check, then corrects the mislabelled row names after you confirm |

### Typical run

```
Command: GVLIST
Select gate valves, or press Enter to scan the whole drawing:  <Enter>

GATE VALVE COORDINATES  (174 points)
POINTS      EASTING          NORTHING
GV1         478042.126       2744292.335
GV2         477976.834       2744283.668
...
GV173       478535.144       2744634.917
GV174       477149.577       2744103.507   <- auto-numbered, no label in drawing

174 point(s); 1 had no GV label.
Run GVTABLE to draw the table, or GVCSV to export.
```

### Settings

`GVSETUP` walks through these; each is stored in the drawing.

| Key | Default | Meaning |
|---|---|---|
| `BLOCKS` | `*CI_PW_GV*,*PW_GV*,*GATE?VALVE*,GV` | Block-name patterns for the valve symbol |
| `LAYERS` | `PW_GV,*$0$PW_GV,*_PW_GV` | Layer patterns — a valve matches on **either** name or layer |
| `LBLLAYER` | `Text-Number` | Layer new `GV<n>` labels go on |
| `CALLAYER` | `Proposed Spare Duct Coordinates` | Layer the `N=` / `E=` callouts go on |
| `PREFIX` | `GV` | Point-name prefix |
| `PREC` | `3` | Decimal places |
| `MAXDIST` | `25.0` | How far a `GV<n>` label may sit from its valve |
| `TBLLAYER` | `Coordinate Table` | Layer holding the coordinate table text |
| `TOL` | `0.150` | How close a table row must be to a valve to count as that valve |
| `ROWTOL` | `1.0` | Y tolerance when grouping table cells into a row |
| `TXTHT` | `1.5` | Text height for labels and callouts |
| `LBLDX` / `LBLDY` | `0.340` / `-3.906` | Where a new label is placed relative to the valve |
| `OFFE` `OFFN` `ROT` `SCL` | `0 0 0 1` | WCS → survey-grid transform (see below) |

Patterns are AutoCAD `wcmatch` patterns and may be comma-separated, so
`*CI_PW_GV*` also catches the bound-xref form
`25_114D_P_NOC_WAT_Rev06$0$…$0$CI_PW_GVN_PROP`. Dynamic blocks are resolved
through their effective name, so anonymous `*U12` names still match.

### Auditing the coordinate table

`GVAUDIT` reads the **GATE VALVE COORDINATES** table, works out which valve each
row's Easting/Northing actually belongs to, and reports any row whose label
disagrees. On the supplied drawing:

```
Command: GVAUDIT
173 table row(s) read from layer "Coordinate Table".
172 agree with the drawing.
1 need attention:
  row labelled GV6 -- mislabelled; its coordinates are GV5 (3 mm)

Run GVFIXTABLE to correct the mislabelled rows.
```

`GVFIXTABLE` lists the same changes and applies them once you confirm. It only
ever rewrites the **point-name** cell, never a coordinate, and only when the row
matches exactly one valve within `TOL`. A row that matches nothing, or matches
two valves, is reported and left alone — so running it against the wrong
drawing corrects nothing rather than guessing.

The table is usually in paper space while the valves are in model space; both
commands search every layout for the table and model space for the valves.

### Drawings that are not on the survey grid

The main drawing models directly on the grid, so the transform stays at its
defaults. A drawing where the design was *pasted* into a local coordinate
system needs the transform filled in — `GV_POINT.dwg` is such a case: its GV1
sits at WCS `(-30171.614, 2372.170)` but belongs at grid
`(478042.126, 2744292.335)`. Set:

```
OFFE = 508213.73975      ROT = 0
OFFN = 2741920.16532     SCL = 1
```

To find the numbers yourself: take one valve whose true coordinates you know,
and subtract its WCS position from its grid position. If the paste was also
rotated or scaled, set `ROT` (degrees counter-clockwise) and `SCL` as well —
the transform is applied as rotate, then scale, then offset.

---

## The offline extractor

For checking a drawing without opening AutoCAD, or for scripting.

```bash
pip install ezdxf

# from a DXF
python3 tools/gv_extract.py drawing.dxf -o gate_valve_coordinates.csv

# from a DWG, via LibreDWG
dwg2dxf -o drawing.dxf drawing.dwg
python3 tools/gv_extract.py drawing.dxf

# large DWGs where the DXF writer gives up part way through
dwgread -O JSON -o drawing.json drawing.dwg
python3 tools/gv_extract.py drawing.json

# a drawing pasted into a local coordinate system
python3 tools/gv_extract.py part.dxf --offset-e 508213.73975 --offset-n 2741920.16532
```

`--audit-table` runs the same table check as `GVAUDIT`, which is a way to see
what `GVFIXTABLE` would change before opening AutoCAD:

```bash
python3 tools/gv_extract.py drawing.json --audit-table
# coordinate table: 173 row(s) on layer 'Coordinate Table', 172 agree with the drawing
#   row labelled GV6 (handle 52281) -- mislabelled; its coordinates are GV5 (3 mm)
```

Useful options: `--table-layer` / `--tol` / `--row-tol` for the audit,
`--block` / `--layer` to match a different valve symbol,
`--label-layer` to restrict where labels are read from (worth setting when the
drawing has a coordinate *table* in model space whose `GV…` cells could be
mistaken for labels), `--max-dist`, `--precision`, `--no-renumber`.

---

## How a valve gets its number

Both tools do the same thing:

1. Collect every insert matching the valve block name **or** layer, in model space.
2. Collect every `GV<n>` text in model space (MTEXT formatting codes stripped).
3. Pair them in two passes:
   - **pass 1** matches on plain distance, purely to learn the drawing's typical
     label offset;
   - **pass 2** rematches every valve against that offset.

   Pass 2 matters. Labels sit at a repeatable offset from their symbol, so in
   the label's own rotated frame the correct pairs cluster tightly. Distance
   alone swaps the labels of valves a few metres apart — on the supplied
   drawing it mis-assigns GV139 and GV173, and pass 2 is what puts them right.
4. Any valve left without a label continues the sequence, and is flagged.

### Checked against the drawing

The 174 generated points were compared with the 173 rows of the drawing's
existing hand-built table: **167 agree within 20 mm**, the largest difference
being 118 mm. The remaining differences and the one extra point are covered in
[`docs/drawing-review.md`](docs/drawing-review.md) — they are discrepancies in
the manual table, not extraction errors.
