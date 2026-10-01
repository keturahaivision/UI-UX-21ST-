#!/usr/bin/env python3
"""L-202 Circulation — entry hierarchy, route hierarchy and accessible widths from the L-200 site model."""
import csv, json, os
from shapely.geometry import LineString, Point
from matplotlib.patches import Circle, Rectangle
from site_model import SITE, W, H, HERE, resolved, CIRC, site_area
from sheet import new_sheet, base_plan, draw_geom, title_block, header

ROUTES = [  # key, name, colour, width m, centrelines, style
    ("P1", "Primary — green spine, 3.0 m accessible", "#d35400", 3.0, [CIRC["spine"]], "-"),
    ("P2", "Primary — jogging & walking loop, 2.0 m", "#1f78b4", 2.0, [CIRC["loop"]], "-"),
    ("S1", "Secondary — accessible links, 2.0 m", "#2a9d8f", 2.0, CIRC["secondary"], "--"),
    ("M1", "Maintenance / emergency route, 4.0 m clear (TO VERIFY)", "#7f8c8d", 4.0,
     [LineString([(13, 0), (13, 9.5)]), LineString([(4, 65), (4, 4)])], ":"),
]
fig, ax, tx = new_sheet()
base_plan(ax)
draw_geom(ax, resolved["03"][2], "#cfe3bf", ec="none", z=2.5)
for key, name, col, wdt, lines, ls in ROUTES:
    for l in lines:
        x, y = l.xy
        ax.plot(x, y, color=col, lw=1.2 + wdt * 1.6, ls=ls, solid_capstyle="round", dash_capstyle="round", zorder=5, alpha=0.9)
        for d in range(6, int(l.length), 12):    # direction ticks
            p, q = l.interpolate(d), l.interpolate(min(d + 0.5, l.length))
            ax.annotate("", xy=(q.x, q.y), xytext=(p.x, p.y), arrowprops=dict(arrowstyle="-|>", lw=1.0, color="white", mutation_scale=12), zorder=6)
# entries and nodes
ax.annotate("", xy=(34, 1.5), xytext=(34, -6), arrowprops=dict(arrowstyle="-|>", lw=3.5, color="#c0392b"), zorder=8)
ax.text(34, -7.2, "E1 MAIN ENTRY (step-free)", ha="center", fontsize=8, color="#c0392b", weight="bold")
ax.annotate("", xy=(1.5, 36), xytext=(-6, 36), arrowprops=dict(arrowstyle="-|>", lw=2.4, color="#c0392b"), zorder=8)
ax.text(-8, 40.5, "E2 SECONDARY\nENTRY", ha="center", fontsize=7, color="#c0392b", weight="bold")
ax.annotate("", xy=(13, 1.5), xytext=(13, -6), arrowprops=dict(arrowstyle="-|>", lw=2.0, color="#7f8c8d", ls=":"), zorder=8)
ax.text(13, -7.2, "E3 SERVICE GATE", ha="center", fontsize=7, color="#7f8c8d", weight="bold")
for k, (x, y) in {"N1": (34, 8), "N2": (52, 36), "N3": (66, 63), "N4": (4, 36)}.items():
    ax.add_patch(Circle((x, y), 2.2, fc="white", ec="#111", lw=1.3, zorder=9)); ax.text(x, y, k, ha="center", va="center", fontsize=8, weight="bold", zorder=10)
# key distances
loop_len, spine_len = CIRC["loop"].length, CIRC["spine"].length
ax.text(46, 67.3, f"loop {loop_len:.0f} m", fontsize=7.5, ha="center", color="#1f78b4", weight="bold")
ax.text(43, 21, f"spine {spine_len:.0f} m", fontsize=7.5, rotation=52, color="#d35400", weight="bold")

header(tx, "L-202", "CIRCULATION PLAN", "Entry hierarchy and accessible circulation widths · derived from L-200")
tx.text(0, 0.90, "ROUTE HIERARCHY", fontsize=11, weight="bold", va="top")
y, rows = 0.87, []
for key, name, col, wdt, lines, ls in ROUTES:
    L = sum(l.length for l in lines)
    tx.plot([0, 0.05], [y, y], color=col, lw=2 + wdt * 1.4, ls=ls, solid_capstyle="round")
    tx.text(0.07, y, f"{key}  {name}", fontsize=8.6, va="center")
    tx.text(1.0, y, f"{L:,.0f} m", fontsize=8.6, va="center", ha="right")
    rows.append({"route": key, "name": name, "width_m": wdt, "length_m": round(L, 1), "area_m2": round(L * wdt, 1)})
    y -= 0.036
y -= 0.005
tx.text(0, y, "ENTRIES & NODES", fontsize=10.5, weight="bold", va="top"); y -= 0.03
for n in ["E1  Main entry — south, step-free, 20 m frontage, 1.5 m level threshold",
          "E2  Secondary entry — west, 4 m gate onto loop",
          "E3  Service gate — south-west, 4 m, locked, maintenance & waste only",
          "N1  Arrival plaza    N2  Central plaza    N3  Clubhouse forecourt",
          "N4  West gate node — loop / secondary entry"]:
    tx.text(0, y, n, fontsize=8, va="top", family="monospace"); y -= 0.022
y -= 0.015
tx.text(0, y, "ACCESSIBILITY STANDARDS (self-check — TO VERIFY)", fontsize=10.5, weight="bold", va="top"); y -= 0.03
for n in ["• Primary route min 1.8 m clear; spine 3.0 m allows 2-way + resting",
          "• Running gradient ≤ 1:20; ≤ 1:12 ramps with landings (see L-500)",
          "• Cross-fall ≤ 1:50; flush kerbs; tactile at road interfaces",
          "• Seating / shade at ≤ 50 m intervals along P1 and P2",
          "• Emergency vehicle: 4.0 m clear / 4.5 m height along M1 — TO VERIFY",
          "• Fully accessible loop: 0 steps on P1, P2 and S1"]:
    tx.text(0, y, n, fontsize=8, va="top", family="monospace"); y -= 0.022
y -= 0.015
tx.text(0, y, "CIRCULATION AREA (from L-200 take-off)", fontsize=10.5, weight="bold", va="top"); y -= 0.03
circ = sum(resolved[k][2].area for k in ("04", "05", "06"))
tx.text(0.02, y, "Paths, loop and spine", fontsize=9, va="center"); tx.text(1.0, y, f"{circ:,.0f} m²  {100*circ/site_area:4.1f} % of site", fontsize=9, va="center", ha="right")
title_block(tx, "L-202", "Circulation Plan")
for ext in ("png", "svg"): fig.savefig(os.path.join(HERE, f"L-202_Circulation.{ext}"), dpi=150, facecolor="white")
with open(os.path.join(HERE, "L-202_Route_Schedule.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
print(json.dumps(rows, indent=1))
