"""
Shared site model — Ras Al Khor Community Park.
Single source of geometry for L-200 (masterplan), L-201 (zoning) and L-202 (circulation).
Import this; do not duplicate polygons in sheet scripts.
"""
from __future__ import annotations
import csv, json, math, os
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union

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


# Circulation centrelines exported for L-202
CIRC = {"loop": loop_cl, "spine": spine_cl, "secondary": sec}
ENTRIES = {"main": (34, 0), "secondary": (0, 36)}
