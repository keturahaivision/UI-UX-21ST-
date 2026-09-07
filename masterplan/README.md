# L-200 Developed Concept Masterplan — Ras Al Khor Community Park

Deterministic masterplan: all geometry is defined in `l200_masterplan.py` as shapely
polygons in site metres. The area take-off is computed from that geometry, so the
plan controls programme extent and quantities. Renders are downstream visualisations.

## Regenerate
```
pip install shapely matplotlib
python3 masterplan/l200_masterplan.py
```

## Outputs
| File | Purpose |
|---|---|
| `L-200_Masterplan.png` / `.svg` | Controlling plan sheet, A2 landscape, 1:400 |
| `L-200_Area_Takeoff.csv` / `.json` | Area by element and by category (soft / hard / activity / structure) |

## Assumptions (Rev P01)
- Net landscape plot assumed 92.0 x 69.0 m = 6,348 m², matching the ~6,340 m² net
  area in the delivery index. Legal boundary TO VERIFY.
- Main arrival from the south road; secondary entry from the west road.
- Court sized 25 x 15 m plus 1 m run-off. Run-offs, play fall zones and lighting
  photometrics TO VERIFY with suppliers and authority.
- All planting TSE-irrigated. Species, tree pits and soil volumes go on L-400.

## Result
Soft landscape 3,904 m² = 61.5 % of net area, above the client's 60 % aspiration
(previous concept: 53.0 %, 441.9 m² shortfall).

## Sheet set (all derived from `site_model.py`)

| Sheet | Script | Outputs |
|---|---|---|
| L-200 Masterplan | `l200_masterplan.py` | `L-200_Masterplan.png/.svg`, `L-200_Area_Takeoff.csv/.json` |
| L-201 Zoning | `l201_zoning.py` | `L-201_Zoning.png/.svg`, `L-201_Zone_Areas.csv` |
| L-202 Circulation | `l202_circulation.py` | `L-202_Circulation.png/.svg`, `L-202_Route_Schedule.csv` |

`site_model.py` holds the boundary, every programme polygon, overlap resolution, the take-off and tree placement. `sheet.py` holds the shared A2 frame. Edit geometry only in `site_model.py`, then rerun the three sheet scripts.
