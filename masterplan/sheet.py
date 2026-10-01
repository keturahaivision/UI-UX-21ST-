"""Shared A2 sheet frame for L-2xx drawings: base plan, context, north, scale bar, title block."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MplPoly, Circle, Rectangle, FancyArrow
from site_model import SITE, W, H, REV, resolved, order, trees, site_area

def draw_geom(ax, g, fc, ec="#333", lw=0.8, hatch=None, z=2, alpha=1.0):
    for p in getattr(g, "geoms", [g]):
        if p.is_empty or p.area < 0.05: continue
        ax.add_patch(MplPoly(list(p.exterior.coords), closed=True, fc=fc, ec=ec, lw=lw, hatch=hatch, zorder=z, alpha=alpha))
        for ring in p.interiors:
            ax.add_patch(MplPoly(list(ring.coords), closed=True, fc="white", ec=ec, lw=lw, zorder=z + 0.1))

def new_sheet():
    fig = plt.figure(figsize=(23.4, 16.5), dpi=150)
    ax = fig.add_axes([0.03, 0.07, 0.66, 0.90]); ax.set_aspect("equal"); ax.axis("off")
    ax.set_xlim(-14, W + 6); ax.set_ylim(-9, H + 6)
    ax.add_patch(Rectangle((-14, -9), W + 20, 9, color="#c9c9c9", zorder=0))
    ax.add_patch(Rectangle((-14, -9), 14, H + 15, color="#c9c9c9", zorder=0))
    ax.text(-7, H / 2, "SIDE ROAD (TO VERIFY)", rotation=90, ha="center", va="center", fontsize=8, color="#555")
    ax.text(W / 2, -4.5, "ACCESS ROAD — MAIN ARRIVAL (TO VERIFY)", ha="center", va="center", fontsize=8, color="#555")
    ax.add_patch(FancyArrow(W + 3, H - 6, 0, 5, width=0.5, head_width=2, head_length=2, color="#111", zorder=9))
    ax.text(W + 3, H + 1.5, "N", ha="center", fontsize=11, weight="bold")
    for i in range(4):
        ax.add_patch(Rectangle((2 + i * 5, -2.6), 5, 0.9, fc="#111" if i % 2 == 0 else "white", ec="#111", zorder=9))
    for i, t in enumerate(["0", "5", "10", "15", "20 m"]):
        ax.text(2 + i * 5, -1.2, t, ha="center", fontsize=7)
    tx = fig.add_axes([0.71, 0.07, 0.27, 0.90]); tx.axis("off"); tx.set_xlim(0, 1); tx.set_ylim(0, 1)
    return fig, ax, tx

def base_plan(ax, grey=True):
    """Ghosted L-200 underlay so every sheet registers to the same geometry."""
    draw_geom(ax, SITE, "#eef0ea" if grey else "#a9c58b", ec="#222", lw=2.0, z=1)
    for k in order:
        name, cat, g = resolved[k]
        draw_geom(ax, g, "#d8d8d4" if cat != "STRUCTURE" else "#a8a49c", ec="#777", lw=0.5, z=2)
    for x, y, r in trees:
        ax.add_patch(Circle((x, y), r, fc="none", ec="#8fa88a", lw=0.6, zorder=3))

def title_block(tx, sheet_no, sheet_name, extra_rows=()):
    tb = 0.0
    tx.add_patch(Rectangle((0, tb), 1, 0.15, fill=False, ec="#111", lw=1.2))
    tx.plot([0, 1], [tb + 0.105, tb + 0.105], color="#111", lw=0.8)
    tx.text(0.02, tb + 0.135, "RAS AL KHOR COMMUNITY PARK", fontsize=10.5, weight="bold", va="center")
    tx.text(0.02, tb + 0.115, f"{sheet_no}  {sheet_name}  ·  Scale 1:400 @ A2", fontsize=8.5, va="center")
    rows = [("ISSUE", f"Rev {REV} — concept sign-off only"), ("DATE", "2026-09-07"),
            ("NET AREA", f"{site_area:,.1f} m² (boundary TO VERIFY)"), ("BASE", "Geometry from L-200 site model")] + list(extra_rows)
    for i, (a, b) in enumerate(rows[:4]):
        tx.text(0.02, tb + 0.085 - i * 0.022, f"{a:<9} {b}", fontsize=8.2, va="center", family="monospace")

def header(tx, sheet_no, title, sub):
    tx.text(0, 0.985, f"{sheet_no}  {title}", fontsize=15, weight="bold", va="top")
    tx.text(0, 0.955, "Ras Al Khor Community Park — Dubai, UAE", fontsize=11, va="top")
    tx.text(0, 0.932, f"Rev {REV} · {sub}", fontsize=8.5, va="top", color="#444")
