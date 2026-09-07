#!/usr/bin/env python3
"""
L-200 Developed Concept Masterplan — Ras Al Khor Community Park
Geometry and take-off live in site_model.py; this script only draws the sheet.
Run:  python3 l200_masterplan.py
"""
import json, os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MplPoly, Circle, Rectangle, FancyArrow
from site_model import *  # noqa: F401,F403

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
