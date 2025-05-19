# Simulated Lotus market for wstETH/USDC

"""Toy Lotus market simulation with five liquidation ticks.

This script demonstrates the adaptive-rate mechanism from the Lotus
interest-rate model.  It generates random daily borrow and supply
activity then records the resulting rates for each tick.

Run ``python3 lotus_market_simulation.py --help`` for command line options.
"""

from dataclasses import dataclass, field
from typing import List, Dict
import math
import random
import csv
import argparse

# Constants from Lotus Interest-Rate Model
U_TARGET = 0.9
K_P = 50  # per year
R_MIN = 0.001  # 0.1% per year expressed as decimal
R_MAX = 2.0    # 200% per year expressed as decimal
SECONDS_IN_YEAR = 365 * 24 * 60 * 60

@dataclass
class Tick:
    lt: float  # liquidation threshold, e.g. 0.75
    target_rate: float  # R̅_t stored rate
    supply: float = 0.0  # direct supply at tick
    borrow: float = 0.0  # direct borrow at tick
    last_update: float = 0.0  # timestamp of last target-rate update

    # computed fields
    borrow_rate: float = 0.0
    supply_rate: float = 0.0

@dataclass
class LotusMarket:
    ticks: List[Tick] = field(default_factory=list)

    def _compute_cascading_quantities(self):
        n = len(self.ticks)
        js = [0.0] * n
        jb = [0.0] * n
        for i in reversed(range(n)):
            js[i] = self.ticks[i].supply + (js[i+1] if i+1 < n else 0.0)
            jb[i] = self.ticks[i].borrow + (jb[i+1] if i+1 < n else 0.0)
        jns = [js[i]-jb[i] for i in range(n)]
        free = [0.0]*n
        min_jns = float('inf')
        for i in range(n):
            min_jns = min(min_jns, jns[i])
            free[i] = min_jns
        util = [0.0]*n
        for i in range(n):
            util[i] = 0.0 if js[i] == 0 else 1 - free[i]/js[i]
            util[i] = min(max(util[i], 0.0), 1.0)
        return js, jb, jns, free, util

    def _update_borrow_rates(self, util):
        n = len(self.ticks)
        for i, tick in enumerate(self.ticks):
            r_t = tick.target_rate
            r_prev = self.ticks[i-1].target_rate if i > 0 else r_t
            r_next = self.ticks[i+1].target_rate if i+1 < n else r_t
            u = util[i]
            if u > U_TARGET:
                slope = (r_next - r_t)/(1 - U_TARGET)
            else:
                slope = (r_t - r_prev)/U_TARGET
            tick.borrow_rate = slope * (u - U_TARGET) + r_t

    def _update_supply_rates(self, js, jb):
        n = len(self.ticks)
        prev_supply_rate = 0.0
        for i, tick in enumerate(self.ticks):
            available_supply = js[i] - (jb[i] - tick.borrow)
            d_t = 0.0 if available_supply == 0 else tick.borrow / available_supply
            tick.supply_rate = d_t * tick.borrow_rate + (1-d_t) * prev_supply_rate
            prev_supply_rate = tick.supply_rate

    def _adapt_target_rates(self, util, dt_seconds):
        for tick, u in zip(self.ticks, util):
            if u > U_TARGET:
                e_t = (u - U_TARGET)/(1 - U_TARGET)
            else:
                e_t = (u - U_TARGET)/U_TARGET
            s_t = math.exp(K_P * e_t * dt_seconds / SECONDS_IN_YEAR)
            tick.target_rate = max(R_MIN, min(R_MAX, tick.target_rate * s_t))
            tick.last_update += dt_seconds
        # cross-tick smoothing
        for i in range(1, len(self.ticks)):
            if self.ticks[i].target_rate < self.ticks[i-1].target_rate:
                self.ticks[i].target_rate = self.ticks[i-1].target_rate

    def step(self, dt_seconds=86400):
        js, jb, jns, free, util = self._compute_cascading_quantities()
        self._update_borrow_rates(util)
        self._update_supply_rates(js, jb)
        self._adapt_target_rates(util, dt_seconds)

    def supply(self, tick_index: int, amount: float):
        self.ticks[tick_index].supply += amount

    def borrow(self, tick_index: int, amount: float):
        self.ticks[tick_index].borrow += amount


def create_sample_market():
    # Example initial target rates increasing with risk
    initial_rates = [0.04, 0.05, 0.06, 0.07, 0.08]  # 4% -> 8%
    lts = [0.75, 0.80, 0.85, 0.90, 0.95]
    ticks = [Tick(lt=lt, target_rate=r) for lt, r in zip(lts, initial_rates)]
    market = LotusMarket(ticks=ticks)
    # Seed with equal supply
    for t in ticks:
        t.supply = 1_000_000.0  # 1m USDC each tick
    return market


def record_state(day: int, market: LotusMarket) -> List[Dict[str, float]]:
    """Return a list of metric dictionaries for the current market state."""
    rows = []
    for idx, t in enumerate(market.ticks):
        rows.append({
            "day": day,
            "tick": idx,
            "lt": t.lt,
            "supply": t.supply,
            "borrow": t.borrow,
            "borrow_rate": t.borrow_rate,
            "supply_rate": t.supply_rate,
            "target_rate": t.target_rate,
        })
    return rows


def run_demo(days: int = 30,
             borrow_amount: float = 50_000.0,
             supply_amount: float = 10_000.0,
             seed: int = 42,
             output_csv: str = "market_history.csv") -> None:
    """Run a random usage simulation and optionally write results to CSV."""
    random.seed(seed)
    market = create_sample_market()
    history: List[Dict[str, float]] = []

    for day in range(1, days + 1):
        b_idx = random.randrange(len(market.ticks))
        s_idx = random.randrange(len(market.ticks))
        market.borrow(b_idx, borrow_amount)
        market.supply(s_idx, supply_amount)
        market.step()
        history.extend(record_state(day, market))

    if output_csv:
        with open(output_csv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=history[0].keys())
            writer.writeheader()
            writer.writerows(history)
        print(f"Simulation complete. Results written to {output_csv}")
    else:
        for row in history:
            print(row)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a simple Lotus market simulation")
    parser.add_argument("--days", type=int, default=30, help="number of simulated days")
    parser.add_argument("--borrow", type=float, default=50_000.0, help="daily borrow amount")
    parser.add_argument("--supply", type=float, default=10_000.0, help="daily supply deposit")
    parser.add_argument("--seed", type=int, default=42, help="random seed")
    parser.add_argument("--output-csv", default="market_history.csv", help="CSV file for results; set empty to print")
    args = parser.parse_args()

    run_demo(days=args.days,
             borrow_amount=args.borrow,
             supply_amount=args.supply,
             seed=args.seed,
             output_csv=args.output_csv if args.output_csv else None)
