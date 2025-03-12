# Lotus Liquidation Simulation

## Overview

This repository contains a Monte Carlo simulation framework for analyzing liquidation risk and bad debt in the Lotus lending protocol. The simulation models how various market conditions and protocol parameters affect liquidation events and credit losses over time.

## Key Features

- **GARCH Price Simulation**: Models asset price volatility using a GARCH(1,1) process to capture volatility clustering
- **Borrower Population Modeling**: Generates realistic borrower distributions with varying health factors and loan sizes
- **Liquidation Mechanics**: Simulates the entire liquidation process including:
  - Slippage based on position size and liquidity depth
  - Network congestion effects on liquidation probability
  - Borrower recollateralization behavior when close to liquidation
  - Lender bonus calculations (5% of the loan value)

## Simulation Parameters

The simulation allows customization of various parameters:

- **Asset-Specific Parameters**:
  - Collateral asset (e.g., ETH)
  - Loan asset (e.g., USDC)
  - Collateral volatility (annualized)
  - Liquidity depth

- **Protocol Parameters**:
  - Liquidation Loan-to-Value (LLTV) ratios
  - Pool fees
  - Network congestion probability
  - Liquidator competition

- **Simulation Settings**:
  - Number of Monte Carlo runs
  - Simulation time horizon (days)

## Outputs

The simulation produces the following key metrics:

- **Credit Loss Statistics**:
  - Mean, median, 95th and 99th percentile of annualized bad debt
  - Liquidation rates
  - Average slippage during liquidations
  - Average bad debt per liquidation
  - Average lender bonus

## How to Run

```bash
python3 main.py
```

This will execute the simulation with default parameters and export the results to a CSV file named `lotus_ETH_USDC_simulation_results.csv`.

## Results Interpretation

The CSV output contains multiple metrics for each LLTV value tested:

- **LLTV**: The Liquidation Loan-to-Value ratio being tested
- **Credit_Loss_Mean**: Average annualized bad debt percentage
- **Credit_Loss_Median**: Median annualized bad debt percentage
- **Credit_Loss_P95**: 95th percentile of annualized bad debt percentage
- **Credit_Loss_P99**: 99th percentile of annualized bad debt percentage
- **Liquidation_Rate**: Percentage of borrowers that get liquidated
- **Avg_Slippage**: Average slippage during liquidations (as percentage)
- **Avg_Bad_Debt_Per_Liquidation**: Average bad debt generated per liquidation event
- **Avg_Lender_Bonus**: Average bonus paid to lenders per liquidation

## Methodology

The simulation follows these steps:

1. Generate price paths using a GARCH(1,1) process
2. Create a realistic borrower population with varying health factors
3. For each price path:
   - Update collateral values and health factors based on price changes
   - Identify borrowers close to liquidation and model recollateralization behavior
   - Process liquidations for borrowers with health factor < 1.0
   - Calculate slippage, liquidation values, and credit losses
   - Track liquidation events and bad debt accumulation
4. Calculate summary statistics across all simulations
5. Export results to CSV

## Use Cases

This simulation framework can be used to:

- Determine optimal LLTV parameters for different asset pairs
- Stress test the protocol under various market conditions
- Estimate expected credit losses for risk management
- Optimize liquidation incentives and mechanisms
