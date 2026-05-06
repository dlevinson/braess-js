#!/usr/bin/env python3
import csv
import json
import math
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import FancyArrowPatch, Patch

ROOT = Path(__file__).resolve().parents[1]
PAPER = ROOT / "findings-paper"
DATA = PAPER / "data"
FIGURES = PAPER / "figures"

CLASS_ORDER = ["BP_RD", "BP_NRD", "NBP_NRD", "NBP_ID"]
CLASS_LABELS = {
    "BP_RD": "BP / reduced demand",
    "BP_NRD": "BP / no demand change",
    "NBP_NRD": "No BP / no demand change",
    "NBP_ID": "No BP / increased demand",
    "BP_ID": "BP / increased demand",
    "NBP_RD": "No BP / reduced demand",
}
CLASS_COLORS = {
    "BP_RD": "#5b1136",
    "BP_NRD": "#ef553b",
    "NBP_NRD": "#d9e4ee",
    "NBP_ID": "#2f7f95",
    "BP_ID": "#f2b701",
    "NBP_RD": "#6a3d9a",
}


def read_csv(path):
    with path.open(newline="") as fh:
        return list(csv.DictReader(fh))


def as_float(value):
    return float(value)


def save(fig, name):
    FIGURES.mkdir(parents=True, exist_ok=True)
    svg_path = FIGURES / f"{name}.svg"
    jpg_path = FIGURES / f"{name}.jpeg"
    fig.savefig(svg_path, bbox_inches="tight")
    fig.savefig(jpg_path, dpi=300, bbox_inches="tight", pil_kwargs={"quality": 95})
    plt.close(fig)


def draw_network_panel(ax):
    positions = {
        "Origin": (0.0, 0.5),
        "Upper": (1.0, 1.0),
        "Lower": (1.0, 0.0),
        "Destination": (2.0, 0.5),
    }
    links = [
        ("Origin", "Upper", r"$t_1(x)=10x$", "#375a7f", "solid", 2.4, (0.00, 0.16)),
        ("Origin", "Lower", r"$t_2(x)=45$", "#375a7f", "solid", 2.4, (0.00, -0.16)),
        ("Upper", "Destination", r"$t_3(x)=45$", "#375a7f", "solid", 2.4, (0.00, 0.16)),
        ("Lower", "Destination", r"$t_4(x)=10x$", "#375a7f", "solid", 2.4, (0.00, -0.16)),
        ("Upper", "Lower", r"$t_5(x)=0$", "#5b1136", "dashed", 2.2, (-0.18, 0.0)),
    ]

    for start, end, label, color, style, width, offset in links:
        x1, y1 = positions[start]
        x2, y2 = positions[end]
        angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
        if angle < -90:
            angle += 180
        if angle > 90:
            angle -= 180
        arrow = FancyArrowPatch(
            (x1, y1),
            (x2, y2),
            arrowstyle="-|>",
            mutation_scale=14,
            linewidth=width,
            linestyle=style,
            color=color,
            shrinkA=13,
            shrinkB=13,
            connectionstyle="arc3,rad=0.0",
        )
        ax.add_patch(arrow)
        ax.text(
            (x1 + x2) / 2 + offset[0],
            (y1 + y2) / 2 + offset[1],
            label,
            color=color,
            fontsize=8.3,
            ha="center",
            va="center",
            rotation=angle,
            rotation_mode="anchor",
            bbox={"facecolor": "white", "edgecolor": "none", "alpha": 0.84, "pad": 1.4},
        )

    for name, (x, y) in positions.items():
        ax.scatter([x], [y], s=230, color="#183456", edgecolor="white", linewidth=1.5, zorder=5)
        ax.text(x, y + 0.17, name, ha="center", va="center", fontsize=8.8, fontweight="bold", color="#183456")
    ax.text(1.18, 0.5, "candidate\nlink", color="#5b1136", fontsize=8.2, ha="left", va="center")

    ax.set_title("Braess network")
    ax.set_xlim(-0.25, 2.25)
    ax.set_ylim(-0.25, 1.25)
    ax.set_aspect("equal")
    ax.axis("off")


def plot_default_comparison(summary):
    fig, axes = plt.subplots(1, 4, figsize=(15.8, 4.4))
    fig.patch.set_facecolor("white")

    fixed = summary["fixed"]
    elastic = summary["elastic"]
    defaults = summary["defaults"]

    draw_network_panel(axes[0])

    a = defaults["inverseDemandA"]
    b = defaults["inverseDemandB"]
    q_max = a / b
    q_values = [index * q_max / 100 for index in range(101)]
    c_values = [a - b * q for q in q_values]

    axes[1].plot(q_values, c_values, color="#183456", linewidth=2.5)
    axes[1].scatter(
        [elastic["offDemand"], elastic["onDemand"]],
        [elastic["offCost"], elastic["onCost"]],
        s=90,
        color=["#375a7f", "#5b1136"],
        zorder=5,
    )
    axes[1].annotate("with link", (elastic["onDemand"], elastic["onCost"]), xytext=(-52, 28), textcoords="offset points", arrowprops={"arrowstyle": "->", "color": "#5b1136"}, color="#5b1136")
    axes[1].annotate("without link", (elastic["offDemand"], elastic["offCost"]), xytext=(22, -28), textcoords="offset points", arrowprops={"arrowstyle": "->", "color": "#375a7f"}, color="#375a7f")
    axes[1].set_title("Elastic demand curve")
    axes[1].set_xlabel("Demand q")
    axes[1].set_ylabel("Generalized cost C(q)")
    axes[1].set_xlim(0, q_max * 1.05)
    axes[1].set_ylim(0, a * 1.05)

    width = 0.36
    x = [0, 1]
    axes[2].bar([value - width / 2 for value in x], [fixed["offCost"], elastic["offCost"]], width=width, color="#375a7f", label="Without link")
    axes[2].bar([value + width / 2 for value in x], [fixed["onCost"], elastic["onCost"]], width=width, color="#5b1136", label="With link")
    axes[2].set_xticks(x, ["Fixed\nq=6", "Elastic\nA=180, B=30"])
    axes[2].set_ylabel("Equilibrium generalized cost")
    axes[2].set_title("Cost comparison")
    axes[2].set_ylim(0, max(fixed["onCost"], elastic["onCost"]) * 1.22)
    axes[2].text(0, max(fixed["offCost"], fixed["onCost"]) + 4, f"+{fixed['deltaCost']:.1f}", ha="center", color="#5b1136", fontweight="bold")
    axes[2].text(1, max(elastic["offCost"], elastic["onCost"]) + 4, f"+{elastic['deltaCost']:.2f}", ha="center", color="#5b1136", fontweight="bold")

    axes[3].bar([value - width / 2 for value in x], [defaults["fixedDemand"], elastic["offDemand"]], width=width, color="#375a7f")
    axes[3].bar([value + width / 2 for value in x], [defaults["fixedDemand"], elastic["onDemand"]], width=width, color="#5b1136")
    axes[3].set_xticks(x, ["Fixed\nq=6", "Elastic\nA=180, B=30"])
    axes[3].set_ylabel("Equilibrium demand")
    axes[3].set_title("Demand comparison")
    axes[3].set_ylim(0, defaults["fixedDemand"] * 1.18)
    axes[3].text(0, defaults["fixedDemand"] - 0.35, "no demand\nresponse", ha="center", va="top", color="white", fontsize=8.5, fontweight="bold")
    axes[3].text(1, max(elastic["offDemand"], elastic["onDemand"]) + 0.15, f"{elastic['deltaDemand']:.2f}", ha="center", color="#2f7f95", fontweight="bold")

    for ax in axes[1:]:
        ax.spines[["top", "right"]].set_visible(False)
        ax.grid(axis="y", alpha=0.18)
    fig.suptitle("Default Braess case", fontsize=15, fontweight="bold")
    fig.text(0.5, -0.02, "The same network change is evaluated under fixed demand and under C(q) = 180 - 30q.", ha="center", color="#5e728f")
    fig.tight_layout()
    save(fig, "figure-1-default-comparison")


def plot_outcome_space(rows):
    z_values = sorted({as_float(row["zValue"]) for row in rows})
    a_values = sorted({as_float(row["inverseDemandA"]) for row in rows})
    b_values = sorted({as_float(row["inverseDemandB"]) for row in rows})
    code = {key: index for index, key in enumerate(CLASS_ORDER)}
    cmap = ListedColormap([CLASS_COLORS[key] for key in CLASS_ORDER])

    fig, axes = plt.subplots(2, 2, figsize=(10.5, 8.4), sharex=True, sharey=True)
    axes = axes.flatten()

    for ax, z in zip(axes, z_values):
      matrix = [[math.nan for _ in b_values] for _ in a_values]
      for row in rows:
          if abs(as_float(row["zValue"]) - z) > 1e-9:
              continue
          a_index = a_values.index(as_float(row["inverseDemandA"]))
          b_index = b_values.index(as_float(row["inverseDemandB"]))
          key = row["classKey"]
          if key in code:
              matrix[a_index][b_index] = code[key]
      ax.imshow(matrix, origin="lower", aspect="auto", cmap=cmap, vmin=-0.5, vmax=len(CLASS_ORDER) - 0.5)
      ax.set_title(f"Variable-link b = {z:g}")
      ax.grid(color="white", linewidth=0.6, alpha=0.45)
      ax.set_xticks(range(len(b_values)))
      ax.set_xticklabels([f"{value:g}" for value in b_values], rotation=45, ha="right")
      ax.set_yticks(range(len(a_values)))
      ax.set_yticklabels([f"{value:g}" for value in a_values])

    for ax in axes[2:]:
        ax.set_xlabel("B: inverse-demand slope")
    for ax in axes[::2]:
        ax.set_ylabel("A: willingness-to-pay intercept")

    handles = [Patch(facecolor=CLASS_COLORS[key], edgecolor="none", label=CLASS_LABELS[key]) for key in CLASS_ORDER]
    fig.legend(handles=handles, loc="lower center", ncol=2, frameon=False)
    fig.suptitle("Elastic-demand outcome space for the Braess network", fontsize=15, fontweight="bold")
    fig.tight_layout(rect=[0, 0.08, 1, 0.95])
    save(fig, "figure-2-elastic-outcome-space")


def main():
    summary = json.loads((DATA / "summary.json").read_text())
    rows = read_csv(DATA / "elastic-outcome-space.csv")
    plot_default_comparison(summary)
    plot_outcome_space(rows)


if __name__ == "__main__":
    main()
