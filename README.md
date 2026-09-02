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
| `data/gate_valve_coordinates.xlsx` | the same list as a formatted Excel workbook |
| `tools/make_xlsx.py` | rebuilds that workbook from the CSV |
| `data/gate_valve_callouts.xlsx` | the plotted table as a callout schedule, checked against the drawing |
| `tools/pdf_table_to_xlsx.py` | builds that from a PDF of the table |
| `lisp/GV_PLACE.lsp` | a standalone script that places a callout at each of the 174 points |
| `tools/make_place_script.py` | regenerates that script from any coordinate CSV |
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
| **GVANNO** | Put a coordinate callout on **every** GV point at once — inserting your `COOR XY` block and filling its attributes |
| **GVLABEL** | Place one boxed callout at a picked point |
| **GVAUDIT** | Check the drawing's **GATE VALVE COORDINATES** table against the valve positions and report any row whose label disagrees. Reports only — changes nothing |
| **GVFIXTABLE** | The same check, then corrects the mislabelled row names after you confirm |
| **GVMARK** | Ring the points on the drawing and label them with a leader — all of them, or just the ones needing attention |
| **GVMARKCLR** | Erase every marker again, before the drawing is issued |
| **GVCHECK** | Report what the tool can actually see — run this first when something hasn't worked |

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
| `MRKLAYER` | `GV-REVIEW` | Layer the review markers go on |
| `MRKSIZE` | `2.5` | Marker ring radius, in drawing units |
| `MRKCOLOR` | `1` | Colour of the marker layer (1 = red) |
| `TBLLAYER` | `Coordinate Table` | Layer holding the coordinate table text |
| `TOL` | `0.150` | How close a table row must be to a valve to count as that valve |
| `ROWTOL` | `1.0` | Y tolerance when grouping table cells into a row |
| `TXTHT` | `1.5` | Text height for labels and callouts |
| `CALBLOCK` | `COOR XY` | Attributed callout block to insert |
| `CALSCALE` | `1.608006` | Its insertion scale |
| `CALROT` | `0.0` | Its rotation, in degrees |
| `CALDIST` | `12.0` | How far a *drawn* coordinate box sits from its point (fallback only) |
| `LBLDX` / `LBLDY` | `0.340` / `-3.906` | Where a new label is placed relative to the valve |
| `OFFE` `OFFN` `ROT` `SCL` | `0 0 0 1` | WCS → survey-grid transform (see below) |

Patterns are AutoCAD `wcmatch` patterns and may be comma-separated, so
`*CI_PW_GV*` also catches the bound-xref form
`25_114D_P_NOC_WAT_Rev06$0$…$0$CI_PW_GVN_PROP`. Dynamic blocks are resolved
through their effective name, so anonymous `*U12` names still match.

### Coordinate callouts

Callouts are placed as **attributed blocks**, not drawn geometry — the drawing's
own `COOR XY` block, inserted at the valve with its `Y1`/`X1`/`Y2`/`X2`
attributes filled in. That keeps them editable with `ATTEDIT`, readable by data
extraction, and identical to what is already on the sheet.

The block is found automatically: an instance already in the drawing wins,
because it carries the rotation and scale that drawing actually uses. Failing
that, `CALBLOCK` is inserted if its definition is present. If neither exists you
are asked to pick one, and only if you decline does the tool fall back to
drawing the box itself.

`GVANNO` places one on every GV point in a single pass:

```
Command: GVANNO
Annotate which points? [All/Select] <All>:
Using callout block "COOR XY" at scale 1.6080.
Placed 174 callout block(s).
One UNDO reverses the whole run.
```

The box and leader come from the block, so they land where the block puts them.
`COOR XY` carries two callout positions (`X1`/`Y1` and `X2`/`Y2`), both filled
with the same coordinates — the same convention as the drawing's existing
callouts — so the clear one can be chosen per valve afterwards.

Only when no block is available does the tool draw a box itself, and then it
positions them automatically: diagonals first, then the axes, then further out,
avoiding both other boxes and every valve. `CALDIST` tunes that fallback.

`GVLABEL` and `GVPICK` place a single callout, asking you to pick where the box
goes so you can dodge existing content.

**Run this on a drawing whose old callouts have been removed.** `GVANNO` adds
callouts, it does not look for existing ones, so you would otherwise end up with
two boxes per valve. Removing them first is worth doing regardless: hand-copied
callouts go stale — in the supplied drawing several carry a neighbour's
coordinates, GV4's box reading GV5's values.

### Placing callouts from a coordinate list

Two ways in, depending on where the coordinates live.

**`GVPLACE`** reads a CSV and places a callout at every row. Columns are found
by name, so order does not matter and extra columns are ignored; a headerless
file is read as name, easting, northing. Coordinates are treated as survey grid
and put through the transform, so they land correctly even in a drawing that
sits in a local system. It reports any point with no gate valve nearby — which
catches a wrong transform or a bad column before you have 174 callouts in the
wrong place.

**`lisp/GV_PLACE.lsp`** is the no-moving-parts version: the coordinates are
written into the script itself, so it reads no file and stores no settings.
Load it and type `GVPLACEPOINTS`. Regenerate it for any list with:

```bash
python3 tools/make_place_script.py data/gate_valve_coordinates.csv -o lisp/GV_PLACE.lsp
```

Both insert the `COOR XY` block and fill its `Y`/`X` attributes with
`N=` / `E=`, and both wrap the run in a single UNDO.

### When something hasn't worked

`GVCHECK` prints what the tool can actually see — how many valve blocks and GV
labels it finds with the current patterns, whether the callout block is in the
drawing, which template it would use, and the grid transform in force. It
changes nothing. Run it before reporting a problem.

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

### Marking points on the drawing

`GVMARK` draws a review marker at each point — a ring round the valve, a leader,
and the point name at the end of it:

```
Command: GVMARK
Mark which points? [All/Flagged/Select] <Flagged>:
```

- **Flagged** (the default) marks only what needs a decision: valves carrying no
  `GV` label, and valves whose coordinate-table row is wrong. On the supplied
  drawing that is two markers — `GV174 - no GV label in drawing` and
  `GV5 - table row reads GV6`.
- **All** marks every point with its name.
- **Select** marks the valves you pick.

Everything lands on layer `GV-REVIEW` in red, created automatically. It is
markup, not drawing content, so keep it on its own layer and strip it with
`GVMARKCLR` before issuing — that erases everything on the marker layer and
nothing else.

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

### As an Excel workbook

```bash
python3 tools/gv_extract.py drawing.json -o data/gate_valve_coordinates.csv
python3 tools/make_xlsx.py
```

`data/gate_valve_coordinates.xlsx` has the list on one sheet — frozen header,
filter row, coordinates to 3 dp, the auto-numbered point highlighted — and the
source, assumptions and points to check on a second. The counts on the Notes
sheet are formulas over the data range, so they stay right if rows are filtered
or added.

### From a plotted PDF of the table

When all you have is a PDF of the coordinate table rather than the DWG:

```bash
pdftotext -layout table.pdf table.txt
python3 tools/pdf_table_to_xlsx.py table.txt -o data/gate_valve_callouts.xlsx \
    --check data/gate_valve_coordinates.csv
```

Each row gets ready-made callout text in the drawing's format — `N=…, E=…` on
one line, plus the two halves in their own columns so they drop straight into
the `N=` / `E=` attributes of a callout block. `--check` compares every row
against where its valve actually sits.

On the supplied table: 173 rows, **166 match the drawing**, 6 sit 37–118 mm off,
and one is the duplicate `GV6` that should read `GV5`.

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
