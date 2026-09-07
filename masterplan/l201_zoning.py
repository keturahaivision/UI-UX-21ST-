#!/usr/bin/env python3
"""L-201 Zoning — colour-coded activity and land-use zones derived from the L-200 site model."""
import csv, json, os
from shapely.ops import unary_union
from matplotlib.patches import Circle, Rectangle
from site_model import SITE, W, H, HERE, resolved, clip, spine_band, site_area, ENTRIES
from sheet import new_sheet, base_plan, draw_geom, title_block, header

# Zones: (key, name, colour, member element keys, buffer m). Precedence = list order.
ZONES = [
    ("Z1", "Arrival & entry",            "#c9b79c", ["01"], 3.0),
    ("Z2", "Central social plaza",       "#e0c48f", ["02", "12a"], 3.0),
    ("Z3", "Active recreation",          "#e39b6a", ["07", "09"], 3.0),
    ("Z4", "Children's play",            "#e8788a", ["08"], 3.0),
    ("Z5", "Community facilities",       "#9d8fbf", ["10"], 3.0),
    ("Z6", "Service & back-of-house",    "#9a9a9a", ["11"], 2.0),
    ("Z7", "Green spine — shade corridor","#5e9a4c", [], 0.0),
    ("Z8", "Passive lawn & planting",    "#b7d49a", [], 0.0),
]
pergolas = resolved["12"][2]
extra = {"12a": max(pergolas.geoms, key=lambda p: p.centroid.y)}   # plaza pergola joins Z2
zones, occupied = {}, None
for key, name, col, members, buf in ZONES:
    if key == "Z7": g = spine_band
    elif key == "Z8": g = SITE
    else: g = unary_union([extra[m] if m in extra else resolved[m][2] for m in members]).buffer(buf, join_style=2)
    g = clip(g)
    if occupied is not None: g = g.difference(occupied)
    zones[key] = (name, col, g)
    occupied = g if occupied is None else unary_union([occupied, g])

fig, ax, tx = new_sheet()
base_plan(ax)
for i, (key, (name, col, g)) in enumerate(reversed(list(zones.items()))):
    draw_geom(ax, g, col, ec="white", lw=1.2, z=4 + i, alpha=0.82)
labels = {"Z1": (34, 5), "Z2": (52, 37), "Z3": (19.5, 52.5), "Z4": (77, 34), "Z5": (79, 57), "Z6": (10, 9.5), "Z7": (46, 20), "Z8": (22, 36)}
ax.add_patch(Circle((70, 11), 2.3, fc="white", ec="#111", lw=1.2, zorder=20)); ax.text(70, 11, "Z3", ha="center", va="center", fontsize=8.5, weight="bold", zorder=21)
for k, (x, y) in labels.items():
    ax.add_patch(Circle((x, y), 2.3, fc="white", ec="#111", lw=1.2, zorder=20))
    ax.text(x, y, k, ha="center", va="center", fontsize=8.5, weight="bold", zorder=21)
ax.annotate("", xy=(34, 1.5), xytext=(34, -6), arrowprops=dict(arrowstyle="-|>", lw=3, color="#c0392b"), zorder=22)
ax.annotate("", xy=(1.5, 36), xytext=(-6, 36), arrowprops=dict(arrowstyle="-|>", lw=2.2, color="#c0392b"), zorder=22)

header(tx, "L-201", "ZONING PLAN", "Activity and land-use zoning · derived from L-200")
tx.text(0, 0.90, "ZONES", fontsize=11, weight="bold", va="top")
y, rows = 0.87, []
for key, (name, col, g) in zones.items():
    tx.add_patch(Rectangle((0, y - 0.012), 0.045, 0.024, fc=col, ec="#333", lw=0.6))
    tx.text(0.06, y, f"{key}  {name}", fontsize=9, va="center")
    tx.text(1.0, y, f"{g.area:,.0f} m²  {100*g.area/site_area:4.1f} %", fontsize=9, va="center", ha="right")
    rows.append({"zone": key, "name": name, "area_m2": round(g.area, 1), "pct": round(100 * g.area / site_area, 1)})
    y -= 0.036
y -= 0.015
tx.text(0, y, "ZONING PRINCIPLES", fontsize=10.5, weight="bold", va="top"); y -= 0.03
for n in ["1. Active and noisy uses (Z3, Z4) held off the residential edge by the",
          "   shade belt; play (Z4) overlooked from the plaza and clubhouse.",
          "2. Green spine (Z7) is the primary shaded pedestrian corridor linking",
          "   arrival, plaza and community facilities.",
          "3. Passive lawn (Z8) wraps all edges as a microclimate buffer and",
          "   absorbs the 60 % soft-landscape requirement.",
          "4. Service zone (Z6) adjacent to the side road for maintenance and",
          "   waste access; no public frontage.",
          "5. Zone boundaries are 3.0 m influence buffers around L-200 elements",
          "   and are indicative for programme control only."]:
    tx.text(0, y, n, fontsize=8, va="top", family="monospace"); y -= 0.022
y -= 0.02
tx.text(0, y, "PROGRAMME BALANCE", fontsize=10.5, weight="bold", va="top"); y -= 0.03
active = sum(zones[k][2].area for k in ("Z3", "Z4")); social = sum(zones[k][2].area for k in ("Z1", "Z2", "Z5"))
passive = sum(zones[k][2].area for k in ("Z7", "Z8"))
for a, b in [("Active recreation & play", active), ("Social, arrival & facilities", social), ("Passive green", passive)]:
    tx.text(0.02, y, a, fontsize=9, va="center"); tx.text(1.0, y, f"{b:,.0f} m²  {100*b/site_area:4.1f} %", fontsize=9, va="center", ha="right"); y -= 0.026
title_block(tx, "L-201", "Zoning Plan")
for ext in ("png", "svg"): fig.savefig(os.path.join(HERE, f"L-201_Zoning.{ext}"), dpi=150, facecolor="white")
with open(os.path.join(HERE, "L-201_Zone_Areas.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
print(json.dumps(rows, indent=1))
