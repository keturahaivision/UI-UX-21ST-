#!/usr/bin/env python3
"""
L-200 Developed Concept Masterplan — Ras Al Khor Community Park
Deterministic geometry: every element is a shapely polygon in site metres.
Areas in the take-off are computed from this geometry, not estimated.

Outputs (written next to this script):
  L-200_Masterplan.png / .svg   controlling plan sheet
  L-200_Area_Takeoff.csv / .json area take-off by element and category

Run:  python3 l200_masterplan.py
"""
from __future__ import annotations
import csv, json, math, os
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MplPoly, Circle, Rectangle, FancyArrow

HERE = os.path.dirname(os.path.abspath(__file__))
REV = "P01"
ISSUE = "Preliminary concept — for client review"

# ----------------------------------------------------------------------------
# 1. SITE BOUNDARY  (TO VERIFY against affection plan / survey)
#    Assumed net landscape plot 92.0 m x 69.0 m = 6,348 m², matching the
#    ~6,340 m² net area in the delivery index. Roads on S and W.
# ----------------------------------------------------------------------------
W, H = 92.0, 69.0
SITE = box(0, 0, W, H)

def clip(g):  # keep everything inside the boundary
    return g.intersection(SITE)

# ----------------------------------------------------------------------------
# 2. PROGRAMME ELEMENTS  (key number, name, category, geometry)
#    category: HARD | ACTIVITY | STRUCTURE | SOFT
# ----------------------------------------------------------------------------
E = {}   # ordered dict of elements

# Primary circulation — accessible jogging / walking loop, 2.0 m wide
loop_cl = LineString([(4, 4), (88, 4), (88, 65), (4, 65), (4, 4)])
E["05"] = ("Jogging & walking loop, 2.0 m", "HARD", clip(loop_cl.buffer(1.0, cap_style=2, join_style=2)))

# Green spine: angular diagonal band from south arrival to NE, 14 m wide
spine_cl = LineString([(34, 6), (50, 27), (58, 44), (66, 64)])
spine_band = clip(spine_cl.buffer(7.0, cap_style=2, join_style=2))
spine_path = clip(spine_cl.buffer(1.5, cap_style=2, join_style=2))   # 3.0 m accessible spine path
E["04"] = ("Green spine accessible path, 3.0 m", "HARD", spine_path)

# South arrival plaza (main entry, step-free)
E["01"] = ("South arrival plaza (main entry)", "HARD", Polygon([(24, 0), (44, 0), (41, 8), (27, 8)]))

# Central plaza — angular, seating walls at edges
E["02"] = ("Central plaza & seating terraces", "HARD", Polygon([(44, 28), (60, 26), (64, 38), (56, 46), (42, 42)]))

# Secondary accessible paths, 2.0 m
sec = [LineString([(44, 40), (33, 50)]),      # plaza -> court
       LineString([(64, 36), (70, 37)]),      # plaza -> play
       LineString([(58, 28), (66, 17)]),      # plaza -> fitness
       LineString([(62, 44), (74, 55)]),      # plaza -> clubhouse
       LineString([(27, 5), (13, 10)])]       # entry -> service
E["06"] = ("Secondary accessible paths, 2.0 m", "HARD", clip(unary_union([l.buffer(1.0, cap_style=2) for l in sec])))

# Activity surfaces
E["07"] = ("Multi-use court 25x15 m + 1 m run-off (TO VERIFY)", "ACTIVITY", box(6, 44, 33, 61))
E["08"] = ("Children's play area, rubber safety surface", "ACTIVITY", Polygon([(66, 26), (86, 24), (86, 42), (70, 46)]))
E["09"] = ("Outdoor fitness zone", "ACTIVITY", Polygon([(62, 7), (76, 6), (78, 15), (65, 17)]))

# Structures
E["10"] = ("Community clubhouse (footprint)", "STRUCTURE", box(74, 52, 84, 62))
E["11"] = ("Service / toilets / plant", "STRUCTURE", box(7, 7, 13, 12))
E["12"] = ("Shade pergolas (3 nos, 4x10 m)", "STRUCTURE",
           unary_union([box(46, 46, 56, 50), box(14, 26, 18, 36), box(76, 16, 86, 20)]))

# ----------------------------------------------------------------------------
# 3. RESOLVE OVERLAPS  (later keys yield to earlier keys) and derive SOFT areas
# ----------------------------------------------------------------------------
order = ["01", "02", "07", "08", "09", "10", "11", "12", "04", "05", "06"]
occupied = None
resolved = {}
for k in order:
    name, cat, g = E[k]
    g = clip(g)
    if occupied is not None:
        g = g.difference(occupied)
    resolved[k] = (name, cat, g)
    occupied = g if occupied is None else unary_union([occupied, g])

spine_soft = spine_band.difference(occupied)
resolved["03"] = ("Green spine — native shade planting", "SOFT", spine_soft)
other_soft = SITE.difference(unary_union([occupied, spine_band]))
resolved["13"] = ("Lawn terraces & planting beds (TSE)", "SOFT", other_soft)

# ----------------------------------------------------------------------------
# 4. TAKE-OFF
# ----------------------------------------------------------------------------
site_area = SITE.area
rows = []
for k in sorted(resolved):
    name, cat, g = resolved[k]
    rows.append({"key": k, "element": name, "category": cat, "area_m2": round(g.area, 1),
                 "pct_of_site": round(100 * g.area / site_area, 1)})
cat_tot = {}
for r in rows:
    cat_tot[r["category"]] = cat_tot.get(r["category"], 0) + r["area_m2"]
soft_pct = 100 * cat_tot["SOFT"] / site_area
target_pct = 60.0
shortfall = max(0.0, target_pct / 100 * site_area - cat_tot["SOFT"])

summary = {
    "sheet": "L-200", "revision": REV, "issue": ISSUE,
    "site_area_m2": round(site_area, 1),
    "categories_m2": {c: round(v, 1) for c, v in cat_tot.items()},
    "categories_pct": {c: round(100 * v / site_area, 1) for c, v in cat_tot.items()},
    "soft_landscape_pct": round(soft_pct, 1),
    "client_target_pct": target_pct,
    "shortfall_to_target_m2": round(shortfall, 1),
    "elements": rows,
}
with open(os.path.join(HERE, "L-200_Area_Takeoff.json"), "w") as f:
    json.dump(summary, f, indent=2)
with open(os.path.join(HERE, "L-200_Area_Takeoff.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)

# ----------------------------------------------------------------------------
# 5. TREE PLANTING  (symbols only — species and pits on L-400)
# ----------------------------------------------------------------------------
trees = []
def along(line, spacing, offset, r):
    n = int(line.length // spacing)
    for i in range(n + 1):
        d = min(i * spacing, line.length)
        p = line.interpolate(d)
        p2 = line.interpolate(min(d + 0.1, line.length))
        dx, dy = p2.x - p.x, p2.y - p.y
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        for s in (1, -1):
            q = Point(p.x + s * offset * nx, p.y + s * offset * ny)
            if SITE.buffer(-1.5).contains(q) and q.distance(occupied) > (0.6 if offset else -1):
                trees.append((q.x, q.y, r))
along(spine_cl, 7.0, 4.5, 3.5)                      # Ghaf / Sidr grove either side of spine path
along(LineString([(2.0, 2.0), (90.0, 2.0), (90.0, 67.0), (2.0, 67.0), (2.0, 2.0)]), 8.0, 0.0, 2.4)  # perimeter shade belt
for x, y in [(50, 22), (40, 34), (38, 60), (60, 60), (86, 10), (20, 20), (30, 30), (10, 40), (26, 24), (84, 47)]:
    if Point(x, y).distance(occupied) > 3.0: trees.append((x, y, 3.0))

# ----------------------------------------------------------------------------
# 6. DRAW SHEET
# ----------------------------------------------------------------------------
COL = {"HARD": "#d9d4c7", "ACTIVITY": "#e7b98a", "STRUCTURE": "#8d8478", "SOFT": "#a9c58b"}
COL_SPINE = "#6f9f5a"
fig = plt.figure(figsize=(23.4, 16.5), dpi=150)          # A2 landscape
ax = fig.add_axes([0.03, 0.07, 0.66, 0.90])
ax.set_aspect("equal"); ax.axis("off")
ax.set_xlim(-14, W + 6); ax.set_ylim(-9, H + 6)

# context: roads and neighbouring plots
ax.add_patch(Rectangle((-14, -9), W + 20, 9, color="#b9b9b9", zorder=0))
ax.add_patch(Rectangle((-14, -9), 14, H + 15, color="#b9b9b9", zorder=0))
for x0 in (-14, ):
    ax.text(-7, H / 2, "SIDE ROAD (TO VERIFY)", rotation=90, ha="center", va="center", fontsize=8, color="#555")
ax.text(W / 2, -4.5, "ACCESS ROAD — MAIN ARRIVAL (TO VERIFY)", ha="center", va="center", fontsize=8, color="#555")
for cx in range(0, int(W) + 1, 12):
    ax.text(cx, -7.5, "▮", ha="center", va="center", fontsize=6, color="#777")   # kerb-side parking indicative

def draw_geom(g, fc, ec="#333", lw=0.8, hatch=None, z=2):
    geoms = getattr(g, "geoms", [g])
    for p in geoms:
        if p.is_empty or p.area < 0.05: continue
        ax.add_patch(MplPoly(list(p.exterior.coords), closed=True, fc=fc, ec=ec, lw=lw, hatch=hatch, zorder=z))
        for ring in p.interiors:
            ax.add_patch(MplPoly(list(ring.coords), closed=True, fc="white", ec=ec, lw=lw, zorder=z + 0.1))

draw_geom(SITE, COL["SOFT"], ec="#222", lw=2.0, z=1)
draw_geom(resolved["03"][2], COL_SPINE, ec="none", z=1.5)
for k in order:
    name, cat, g = resolved[k]
    hatch = {"HARD": None, "ACTIVITY": "..", "STRUCTURE": "//"}.get(cat)
    draw_geom(g, COL[cat], hatch=hatch, z=3 if cat != "STRUCTURE" else 4)
# court markings
ax.add_patch(Rectangle((7, 45), 25, 15, fill=False, ec="#8a5a2b", lw=1.0, zorder=5))
ax.plot([19.5, 19.5], [45, 60], color="#8a5a2b", lw=0.8, zorder=5)
ax.add_patch(Circle((19.5, 52.5), 3, fill=False, ec="#8a5a2b", lw=0.8, zorder=5))
# trees
for x, y, r in trees:
    ax.add_patch(Circle((x, y), r, fc="#5e8f48", ec="#2f5a22", lw=0.6, alpha=0.75, zorder=6))
    ax.add_patch(Circle((x, y), 0.35, fc="#2f5a22", ec="none", zorder=7))
# entry arrows
for (x, y, dx, dy) in [(34, -3, 0, 4.5), (2.5, 36, 0, 0), ]:
    if dx or dy:
        ax.add_patch(FancyArrow(x, y, dx, dy, width=1.4, head_width=3.5, head_length=2, color="#c0392b", zorder=8))
ax.text(34, -6.5, "MAIN ENTRY", ha="center", fontsize=8, color="#c0392b", weight="bold")
ax.add_patch(FancyArrow(-5, 36, 5.5, 0, width=1.0, head_width=2.6, head_length=1.8, color="#c0392b", zorder=8))
ax.text(-8, 40, "SECONDARY\nENTRY", ha="center", fontsize=7, color="#c0392b", weight="bold")

# key bubbles
label_pts = {"01": (34, 3.5), "02": (52, 36), "03": (44, 17), "04": (61, 51), "05": (46, 65), "06": (38, 46),
             "07": (11, 48), "08": (77, 34), "09": (70, 11), "10": (79, 57), "11": (10, 9.5), "12": (16, 31), "13": (24, 40)}
for k, (x, y) in label_pts.items():
    ax.add_patch(Circle((x, y), 2.1, fc="white", ec="#111", lw=1.2, zorder=9))
    ax.text(x, y, k, ha="center", va="center", fontsize=8.5, weight="bold", zorder=10)

# north arrow + scale bar
ax.add_patch(FancyArrow(W + 3, H - 6, 0, 5, width=0.5, head_width=2, head_length=2, color="#111", zorder=9))
ax.text(W + 3, H + 1.5, "N", ha="center", fontsize=11, weight="bold")
for i in range(4):
    ax.add_patch(Rectangle((2 + i * 5, -2.6), 5, 0.9, fc="#111" if i % 2 == 0 else "white", ec="#111", zorder=9))
for i, t in enumerate(["0", "5", "10", "15", "20 m"]):
    ax.text(2 + i * 5, -1.2, t, ha="center", fontsize=7)

# ---- legend / take-off / title block (right column) ----
tx = fig.add_axes([0.71, 0.07, 0.27, 0.90]); tx.axis("off"); tx.set_xlim(0, 1); tx.set_ylim(0, 1)
tx.text(0, 0.985, "L-200  DEVELOPED CONCEPT MASTERPLAN", fontsize=15, weight="bold", va="top")
tx.text(0, 0.955, "Ras Al Khor Community Park — Dubai, UAE", fontsize=11, va="top")
tx.text(0, 0.932, f"Rev {REV} · {ISSUE} · Scale 1:400 @ A2", fontsize=8.5, va="top", color="#444")
tx.text(0, 0.90, "KEY", fontsize=11, weight="bold", va="top")
y = 0.875
for k in sorted(resolved):
    name, cat, g = resolved[k]
    tx.add_patch(Rectangle((0, y - 0.012), 0.045, 0.02, fc=COL_SPINE if k == "03" else COL[cat], ec="#333", lw=0.6,
                           hatch={"ACTIVITY": "..", "STRUCTURE": "//"}.get(cat)))
    tx.text(0.06, y, f"{k}  {name}", fontsize=8.6, va="center")
    tx.text(1.0, y, f"{g.area:,.0f} m²", fontsize=8.6, va="center", ha="right")
    y -= 0.026
y -= 0.01
tx.text(0, y, "AREA TAKE-OFF (computed from plan geometry)", fontsize=10.5, weight="bold", va="top"); y -= 0.035
for cat in ["SOFT", "HARD", "ACTIVITY", "STRUCTURE"]:
    tx.text(0.02, y, f"{cat.title()} landscape", fontsize=9, va="center")
    tx.text(1.0, y, f"{cat_tot[cat]:,.1f} m²   {100*cat_tot[cat]/site_area:4.1f} %", fontsize=9, va="center", ha="right")
    y -= 0.023
tx.text(0.02, y, "Net landscape area", fontsize=9, weight="bold", va="center")
tx.text(1.0, y, f"{site_area:,.1f} m²   100 %", fontsize=9, weight="bold", va="center", ha="right"); y -= 0.034
status = "ACHIEVED" if shortfall == 0 else f"SHORTFALL {shortfall:,.0f} m²"
tx.text(0, y, f"Client soft-landscape target 60 % — {status}", fontsize=9.5, weight="bold",
        color="#1f6f2f" if shortfall == 0 else "#b03a2e", va="top"); y -= 0.04
tx.text(0, y, "NOTES", fontsize=10.5, weight="bold", va="top"); y -= 0.03
notes = ["1. Geometry in this drawing controls programme extent and quantities.",
         "2. Legal boundary, survey levels, existing trees, utilities, easements,",
         "   drainage outfall and emergency access are TO VERIFY.",
         "3. Court dimension and run-offs, play fall zones and lighting",
         "   photometrics TO VERIFY with suppliers and authority.",
         "4. All planting TSE-irrigated; species, pits and soil volumes on L-400.",
         "5. Tree symbols indicative; final count on L-400 planting schedule.",
         "6. Renders (R01–R03) are concept visualisations — not to scale."]
for n in notes:
    tx.text(0, y, n, fontsize=7.6, va="top", family="monospace"); y -= 0.019
tb = 0.0
tx.add_patch(Rectangle((0, tb), 1, 0.15, fill=False, ec="#111", lw=1.2))
tx.plot([0, 1], [tb + 0.105, tb + 0.105], color="#111", lw=0.8)
tx.text(0.02, tb + 0.135, "RAS AL KHOR COMMUNITY PARK", fontsize=10.5, weight="bold", va="center")
tx.text(0.02, tb + 0.115, "L-200  Developed Concept Masterplan  ·  Scale 1:400 @ A2", fontsize=8.5, va="center")
for i, (a, b) in enumerate([("ISSUE", f"Rev {REV} — concept sign-off only"), ("DATE", "2026-09-07"),
                            ("NET AREA", f"{site_area:,.1f} m² (boundary TO VERIFY)"), ("TREES", f"{len(trees)} nos indicative")]):
    tx.text(0.02, tb + 0.085 - i * 0.022, f"{a:<9} {b}", fontsize=8.2, va="center", family="monospace")

for ext in ("png", "svg"):
    fig.savefig(os.path.join(HERE, f"L-200_Masterplan.{ext}"), dpi=150, facecolor="white")
print(json.dumps({k: v for k, v in summary.items() if k != "elements"}, indent=2))
for r in rows: print(r)
