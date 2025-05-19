# lotus-research

This repository collects experiments around the Lotus interest-rate model.

## Simulations

- `Lotus Liquidation Simulation/` contains a Monte Carlo liquidation risk simulator.
- `lotus_market_simulation.py` simulates a Lotus market with five liquidation
  ticks (75%–95% LT) for the wstETH/USDC pair. It now supports command line
  options and records rates to a CSV file for further analysis.

Run the market demo with the defaults:

```bash
python3 lotus_market_simulation.py
```

You can customise the run, for example thirty days with larger daily borrows and
CSV output:

```bash
python3 lotus_market_simulation.py --days 30 --borrow 100000 --output-csv rates.csv
```
