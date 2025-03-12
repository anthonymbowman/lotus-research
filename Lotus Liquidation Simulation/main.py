import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
from dataclasses import dataclass
from scipy.stats import norm
import datetime

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class LotusSimulator:
    """
    Simulator for bad debt realization in the Lotus lending protocol.
    Uses Monte Carlo simulation with GARCH processes to model asset price movements
    and agent-based modeling for borrower and liquidator behavior.
    """

    collateral_asset: str
    loan_asset: str
    collateral_volatility: float
    liq_depth_2_percent: float = 7_200_000.0
    pool_fee: float = 0.0005
    correlation_matrix: Optional[np.ndarray] = None
    simulation_days: int = 365
    monte_carlo_runs: int = 5000
    initial_price: float = 2000.0
    network_congestion_probability: float = 0.05
    liquidator_competition: float = 0.8

    def __post_init__(self) -> None:
        self.garch_params = {
            "omega": 0.000126,
            "alpha": 0.20,
            "beta": 0.75,
        }

        self.borrower_params = {
            "recollateralization_probability": 0.3,
            "recollateralization_threshold": 0.05,
            "borrower_distribution": "realistic",
            "health_factor_mean": 1.5,
            "health_factor_std": 0.3,
        }

        self.liquidator_params = {
            "response_time_mean": 2,
            "response_time_std": 1,
            "min_profit_threshold": 0.005,
        }
        
        self.results: Optional[Dict] = None

    def _generate_price_paths(self, lltv_values: List[float]) -> np.ndarray:
        daily_vol = self.collateral_volatility / np.sqrt(365)
        price_paths = np.full((self.monte_carlo_runs, self.simulation_days + 1), self.initial_price)
        sigma2 = np.full(self.monte_carlo_runs, daily_vol ** 2)
        
        omega, alpha, beta = (
            self.garch_params["omega"],
            self.garch_params["alpha"],
            self.garch_params["beta"],
        )
        
        for t in range(1, self.simulation_days + 1):
            z = np.random.normal(size=self.monte_carlo_runs)
            returns = np.sqrt(sigma2) * z
            price_paths[:, t] = price_paths[:, t - 1] * np.exp(returns)
            sigma2 = omega + alpha * (returns ** 2) + beta * sigma2
        
        return price_paths

    def _simulate_borrower_population(self, lltv: float) -> pd.DataFrame:
        num_borrowers = 4000
        if self.borrower_params["borrower_distribution"] == "realistic":
            mean_log_hf = 0.47
            sigma_log_hf = 0.6
            health_factors = np.random.lognormal(mean_log_hf, sigma_log_hf, num_borrowers)
            health_factors = np.clip(health_factors, 1.039, 4.0)
        else:
            health_factors = np.random.uniform(1.039, 2.0, num_borrowers)

        loan_to_value = lltv / health_factors
        alpha = 0.5
        scale_factor = 50000
        collateral_values = np.random.pareto(alpha, num_borrowers) * scale_factor
        collateral_values = np.clip(collateral_values, 100, 10_000_000)
        loan_values = collateral_values * loan_to_value

        borrowers = pd.DataFrame({
            "borrower_id": range(num_borrowers),
            "collateral_value": collateral_values,
            "loan_value": loan_values,
            "initial_ltv": loan_to_value,
            "health_factor": health_factors,
        })

        borrowers = borrowers[borrowers["loan_value"] >= 10000].reset_index(drop=True)
        borrowers["borrower_id"] = borrowers.index
        return borrowers

    def _calculate_liquidations(
        self, borrowers: pd.DataFrame, price_path: np.ndarray, lltv: float
    ) -> Tuple[float, pd.DataFrame]:
        active_borrowers = borrowers.copy()
        liquidation_events = []
        total_bad_debt = 0.0
        initial_total_loans = active_borrowers["loan_value"].sum()

        for day in range(1, len(price_path)):
            price_change = price_path[day] / price_path[day - 1]
            active_borrowers["collateral_value"] *= price_change
            active_borrowers["health_factor"] = active_borrowers["collateral_value"] * lltv / active_borrowers["loan_value"]

            network_congested = np.random.random() < self.network_congestion_probability
            liquidatable = active_borrowers[active_borrowers["health_factor"] < 1.0].copy()

            close_to_liquidation = active_borrowers[
                (active_borrowers["health_factor"] >= 1.0) &
                (active_borrowers["health_factor"] < 1.0 + self.borrower_params["recollateralization_threshold"])
            ]

            for _, borrower in close_to_liquidation.iterrows():
                if np.random.random() < self.borrower_params["recollateralization_probability"]:
                    target_health = 1.2
                    needed_collateral = target_health * borrower["loan_value"] / lltv - borrower["collateral_value"]
                    # Apply the recollateralization
                    idx = borrower.name
                    active_borrowers.loc[idx, "collateral_value"] += needed_collateral
                    active_borrowers.loc[idx, "health_factor"] = target_health

            # Process liquidations
            for _, borrower in liquidatable.iterrows():
                # Calculate slippage based on position size and liquidity depth
                position_size = borrower["collateral_value"]
                depth_ratio = position_size / self.liq_depth_2_percent
                
                # Base slippage from pool fee
                base_slippage = self.pool_fee
                
                # Additional slippage from market impact (quadratic relationship)
                market_impact = (depth_ratio ** 2) * 0.02  # 2% at full depth utilization
                
                # Total estimated slippage (capped at 20%)
                estimated_slippage = min(base_slippage + market_impact, 0.2)
                
                # Determine if liquidation occurs based on network conditions
                liquidation_occurs = not network_congested or np.random.random() < 0.3
                
                if liquidation_occurs:
                    # Calculate liquidation value after slippage
                    liquidation_value = borrower["collateral_value"] * (1 - estimated_slippage)
                    
                    # Apply liquidation bonus as a percentage of debt (loan value) instead of collateral
                    lender_bonus = borrower["loan_value"] * 0.05  # 5% of the loan value as bonus
                    
                    # Calculate credit loss (can be negative if liquidation value exceeds loan)
                    credit_loss = borrower["loan_value"] - liquidation_value
                    
                    # Update total bad debt based on credit loss and lender bonus separately
                    if credit_loss > 0:
                        total_bad_debt += credit_loss
                    
                    # Subtract lender bonus from total bad debt (if any)
                    total_bad_debt -= lender_bonus
                    
                    # Record liquidation event
                    liquidation_events.append({
                        "day": day,
                        "borrower_id": borrower["borrower_id"],
                        "collateral_value": borrower["collateral_value"],
                        "loan_value": borrower["loan_value"],
                        "liquidation_value": liquidation_value,
                        "lender_bonus": lender_bonus,
                        "credit_loss": max(0, credit_loss),
                        "liquidation_bonus": lender_bonus,
                        "net_impact": -credit_loss + lender_bonus,
                        "health_factor": borrower["health_factor"],
                        "slippage": estimated_slippage,
                        "bad_debt": max(0, credit_loss)  # For backward compatibility
                    })
                    
                    # Remove liquidated borrower
                    active_borrowers = active_borrowers[active_borrowers["borrower_id"] != borrower["borrower_id"]]
        
        # Calculate bad debt as percentage of initial total loans
        bad_debt_percent = (total_bad_debt / initial_total_loans) * 100 if initial_total_loans > 0 else 0
        
        # Annualize the bad debt percentage (convert from simulation period to annual rate)
        days_in_simulation = len(price_path) - 1
        annualized_bad_debt_percent = bad_debt_percent * (365 / days_in_simulation)
        
        # Create dataframe of liquidation events
        liquidation_df = pd.DataFrame(liquidation_events) if liquidation_events else pd.DataFrame()
        
        return annualized_bad_debt_percent, liquidation_df

    def run_simulation(self, lltv_values: List[float]) -> pd.DataFrame:
        """
        Run the full simulation for multiple LLTV values.
        
        Args:
            lltv_values: List of LLTV values to simulate
            
        Returns:
            DataFrame with simulation results
        """
        print(f"Running simulation for {self.collateral_asset}/{self.loan_asset}...")
        print(f"Generating {self.monte_carlo_runs} price paths for {self.simulation_days} days...")
        
        # Generate price paths once for all LLTV values
        price_paths = self._generate_price_paths(lltv_values)
        
        results = []
        
        # For each LLTV value
        for lltv in lltv_values:
            print(f"Simulating LLTV = {lltv:.2%}...")
            
            # Generate borrower population
            borrowers = self._simulate_borrower_population(lltv)
            
            # Track bad debt across all simulations
            bad_debt_percentages = []
            liquidation_dfs = []
            
            # For each price path (Monte Carlo run)
            for i in range(self.monte_carlo_runs):
                if i % 1000 == 0 and i > 0:
                    print(f"  Completed {i} of {self.monte_carlo_runs} runs")
                    
                bad_debt_percent, liquidation_df = self._calculate_liquidations(
                    borrowers=borrowers,
                    price_path=price_paths[i, :],
                    lltv=lltv
                )
                
                bad_debt_percentages.append(bad_debt_percent)
                if not liquidation_df.empty:
                    liquidation_dfs.append(liquidation_df)
            
            # Calculate statistics
            mean_bad_debt = np.mean(bad_debt_percentages)
            median_bad_debt = np.median(bad_debt_percentages)
            p95_bad_debt = np.percentile(bad_debt_percentages, 95)
            p99_bad_debt = np.percentile(bad_debt_percentages, 99)
            
            # Combine all liquidation events for this LLTV
            all_liquidations = pd.concat(liquidation_dfs) if liquidation_dfs else pd.DataFrame()
            
            # Calculate other metrics if liquidations occurred
            if not all_liquidations.empty:
                liquidation_rate = len(all_liquidations) / (self.monte_carlo_runs * len(borrowers))
                avg_slippage = all_liquidations['slippage'].mean() if 'slippage' in all_liquidations.columns else 0
                avg_bad_debt_per_liquidation = all_liquidations['credit_loss'].mean() if 'credit_loss' in all_liquidations.columns else 0
                avg_lender_bonus = all_liquidations['lender_bonus'].mean() if 'lender_bonus' in all_liquidations.columns else 0
            else:
                liquidation_rate = 0
                avg_slippage = 0
                avg_bad_debt_per_liquidation = 0
                avg_lender_bonus = 0
            
            # Store results
            results.append({
                'LLTV': lltv,
                'Credit_Loss_Mean': mean_bad_debt,
                'Credit_Loss_Median': median_bad_debt,
                'Credit_Loss_P95': p95_bad_debt,
                'Credit_Loss_P99': p99_bad_debt,
                'Liquidation_Rate': liquidation_rate * 100,  # as percentage
                'Avg_Slippage': avg_slippage * 100,  # as percentage
                'Avg_Bad_Debt_Per_Liquidation': avg_bad_debt_per_liquidation,
                'Avg_Lender_Bonus': avg_lender_bonus
            })
        
        # Convert results to DataFrame
        self.results = pd.DataFrame(results)
        
        print("Simulation complete!")
        return self.results
    
    def export_results(self, filename: str = "lotus_simulation_results.csv") -> str:
        """
        Export simulation results to CSV.
        
        Args:
            filename: Output filename
            
        Returns:
            Path to saved file
        """
        if self.results is None:
            raise ValueError("No simulation results available. Run simulation first.")
        
        self.results.to_csv(filename, index=False)
        print(f"Results exported to {filename}")
        return filename


def main():
    """Main function to run the simulation."""
    # Define asset pair for simulation
    collateral_asset = "ETH"
    loan_asset = "USDC"
    
    # Set parameters based on historical data
    collateral_volatility = 0.70  # 70% annualized volatility for ETH
    liq_depth_2_percent = 7_200_000.0  # Liquidity depth 2% below current price ($)
    pool_fee = 0.0005  # Uniswap V3 pool fee (0.05%)
    
    # Define LLTV values to test (from 50% to 95%)
    lltv_values = [0.85, 0.875, 0.90, 0.925, 0.95]
    
    # Create simulator
    simulator = LotusSimulator(
        collateral_asset=collateral_asset,
        loan_asset=loan_asset,
        collateral_volatility=collateral_volatility,
        liq_depth_2_percent=liq_depth_2_percent,
        pool_fee=pool_fee,
        monte_carlo_runs=1000,  # 5,000 simulations for reasonable runtime
        simulation_days=30     # 1 year simulation
    )
    
    # Run simulation
    results = simulator.run_simulation(lltv_values)
    
    # Display results
    print("\nSimulation Results:")
    print(results.to_string(index=False))
    
    # Export to CSV
    output_file = f"lotus_{collateral_asset}_{loan_asset}_simulation_results.csv"
    simulator.export_results(output_file)


if __name__ == "__main__":
    main()
