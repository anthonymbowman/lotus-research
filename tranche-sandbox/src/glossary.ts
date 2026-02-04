export interface GlossaryEntry {
  term: string;
  shortDef: string;
  fullDef: string;
  formula?: string;
  example?: string;
  related?: string[];
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  ltv: {
    term: 'LTV',
    shortDef: 'Loan-to-Value — the current ratio of your borrowed amount to your collateral value.',
    fullDef: 'LTV measures how much you\'ve borrowed relative to your collateral. Unlike LLTV (which is the maximum), LTV is your current position. If your LTV exceeds the tranche\'s LLTV, your position becomes liquidatable.',
    formula: 'LTV = Borrowed Amount / Collateral Value',
    example: 'Borrowed $6,000 against $10,000 collateral → LTV = 60%',
    related: ['lltv', 'health-factor', 'liquidation'],
  },

  lif: {
    term: 'LIF',
    shortDef: 'Liquidation Incentive Factor — the bonus liquidators receive for repaying bad debt.',
    fullDef: 'LIF determines how much collateral a liquidator receives per unit of debt they repay. A LIF of 1.10 means liquidators get $1.10 in collateral for every $1.00 of debt repaid. Higher LLTV tranches have lower LIF (less profit for liquidators), which can slow liquidations.',
    formula: 'LIF = min(1.15, 1 / (0.3 × LLTV + 0.7))',
    example: 'At 85% LLTV, LIF ≈ 1.08 → liquidators earn 8% profit on liquidations',
    related: ['liquidation', 'lltv', 'bad-debt'],
  },

  tranche: {
    term: 'Tranche',
    shortDef: 'A risk tier defined by its LLTV — higher LLTV means higher risk and higher potential yield.',
    fullDef: 'Tranches are risk layers in Lotus Protocol. Each tranche has a specific LLTV (like 75%, 85%, 95%). Lenders choose which tranche to supply to based on their risk tolerance. Senior tranches (lower LLTV) are safer but earn less, while junior tranches (higher LLTV) earn more but face more bad debt risk.',
    example: '75% LLTV tranche = senior/safer, 95% LLTV tranche = junior/riskier',
    related: ['lltv', 'tranche-seniority', 'cascade'],
  },

  'cascading-supply': {
    term: 'Cascading Supply',
    shortDef: 'Unused supply from junior tranches flows upward to support senior borrowers.',
    fullDef: 'Unlike isolated lending pools, Lotus connects tranches through cascading supply. When borrowers at a senior tranche need liquidity, they can use supply from junior tranches that isn\'t being utilized at that level. This maximizes capital efficiency.',
    example: 'If 95% LLTV has $5M unused supply, it can support 75% LLTV borrowers',
    related: ['connected-liquidity', 'tranche', 'free-supply'],
  },

  'free-supply': {
    term: 'Free Supply',
    shortDef: 'The amount of liquidity available to be borrowed or withdrawn from a tranche.',
    fullDef: 'Free Supply represents the liquidity that can actually be accessed. It\'s constrained by the minimum Junior Net Supply across all more senior tranches. Even if a junior tranche has excess liquidity, it can only be withdrawn if senior tranches also have available liquidity.',
    formula: 'Free Supply = min(Jr Net Supply at this and all senior tranches)',
    example: 'If 75% tranche has 1000 Jr Net and 80% has 500, the 80% free supply is limited to 500',
    related: ['cascading-supply', 'connected-liquidity'],
  },

  lltv: {
    term: 'LLTV',
    shortDef: 'Loan-to-Liquidation-Value — the maximum percentage you can borrow against your collateral before liquidation.',
    fullDef: 'LLTV determines when a position becomes liquidatable. An 80% LLTV means if you deposit $10,000 collateral, you can borrow up to $8,000 before risking liquidation. Higher LLTVs offer more leverage but leave less buffer before liquidation.',
    formula: 'LLTV = Max Borrow / Collateral Value',
    example: 'At 80% LLTV with $10,000 collateral: max borrow = $8,000, liquidation buffer = 20%',
    related: ['health-factor', 'liquidation', 'tranche-seniority'],
  },

  'health-factor': {
    term: 'Health Factor',
    shortDef: 'A measure of position safety. Above 1 = safe, below 1 = liquidatable.',
    fullDef: 'Health Factor compares your current loan-to-value against the tranche\'s LLTV limit. A health factor of 1.5 means your collateral could drop 33% before liquidation. Below 1.0, your position can be liquidated.',
    formula: 'Health Factor = LLTV / Current LTV',
    example: 'Current LTV 60%, LLTV 80% → Health Factor = 0.80/0.60 = 1.33 (safe)',
    related: ['lltv', 'liquidation'],
  },

  'tranche-seniority': {
    term: 'Tranche Seniority',
    shortDef: 'Senior tranches (lower LLTV) are safer and earn less. Junior tranches (higher LLTV) earn more and face higher loss risk; losses are allocated by supply utilization and cascade to junior tranches.',
    fullDef: 'Think of tranches like floors in a building during a flood. Senior tranches are higher floors — water (losses) reaches them later. Losses are allocated by supply utilization at each level and cascade from senior to junior, so junior tranches face higher loss risk and earn higher yields to compensate.',
    example: '75% LLTV = senior (safer, ~4% yield), 95% LLTV = junior (riskier, ~8% yield)',
    related: ['lltv', 'cascade', 'bad-debt'],
  },

  liquidation: {
    term: 'Liquidation',
    shortDef: 'When your collateral is seized and sold to repay your debt because your position became too risky.',
    fullDef: 'Liquidation protects lenders by ensuring debt is repaid before collateral value falls too far. When your LTV exceeds the tranche\'s LLTV, liquidators can repay your debt and receive your collateral at a discount. You lose your collateral but your debt is cleared.',
    example: 'If collateral drops from $10,000 to $8,500 and you borrowed $8,000 at 95% LLTV, liquidators can seize your collateral.',
    related: ['lltv', 'health-factor', 'bad-debt'],
  },

  'bad-debt': {
    term: 'Bad Debt',
    shortDef: 'Debt that cannot be fully recovered from liquidation — the shortfall is absorbed by lenders.',
    fullDef: 'Bad debt occurs when collateral value drops so fast that even after liquidation, there\'s not enough to cover the debt. This shortfall is allocated by supply utilization at each tranche and cascades from senior to junior; the most junior tranche absorbs whatever remains if supply is still available.',
    example: 'Borrower owes $10,000, collateral liquidates for $9,000 → $1,000 bad debt absorbed by tranches',
    related: ['liquidation', 'cascade', 'tranche-seniority'],
  },

  cascade: {
    term: 'Cascade',
    shortDef: 'How interest and bad debt flow through tranches — from senior to junior.',
    fullDef: 'The cascade mechanism distributes interest and absorbs bad debt proportionally based on supply utilization at each tranche level. Interest generated at each level cascades down to more junior tranches. Bad debt follows the same path, being absorbed proportionally at each level.',
    formula: 'Absorbed = (Local Interest + Cascaded In) × Supply Utilization',
    related: ['tranche-seniority', 'supply-utilization'],
  },

  'supply-utilization': {
    term: 'Supply Utilization',
    shortDef: 'The share of a tranche\'s available supply that comes from its own lenders.',
    fullDef: 'Supply utilization is supply divided by available supply. It determines how much interest and bad debt stays at a tranche vs cascading to junior tranches. In valid LLTV-ordered markets, the most junior tranche has 100% supply utilization.',
    formula: 'Supply Utilization = Supply / Available Supply',
    example: 'If $8M is supplied and available supply is $10M, utilization = 80%',
    related: ['supply-rate', 'cascade', 'borrow-utilization'],
  },

  'borrow-utilization': {
    term: 'Borrow Utilization',
    shortDef: 'The share of junior supply that is currently utilized by borrows.',
    fullDef: 'Borrow utilization is one minus free supply divided by junior supply. This is the utilization signal that drives IRM credit spreads and borrow rates.',
    formula: 'Borrow Utilization = 1 − (Free Supply / Jr Supply)',
    example: 'If Jr Supply is 10,000 and Free Supply is 2,000 → borrow utilization = 80%',
    related: ['borrow-rate', 'spread', 'supply-utilization'],
  },

  spread: {
    term: 'Credit Spread',
    shortDef: 'The additional rate set by the IRM on top of the base rate.',
    fullDef: 'The credit spread is set by the Interest Rate Model (IRM) based on borrow utilization. It represents the premium borrowers pay above the base rate to compensate lenders for risk and to incentivize liquidity provision.',
    formula: 'Borrow Rate = Base Rate + Credit Spread',
    example: 'Base rate 3%, credit spread 2% → borrow rate = 5%',
    related: ['supply-rate', 'borrow-rate', 'borrow-lend-spread'],
  },

  'borrow-lend-spread': {
    term: 'Borrow-Lend Spread',
    shortDef: 'The gap between what borrowers pay and what lenders receive.',
    fullDef: 'In traditional lending, the borrow-lend spread is "lost" value — borrowers pay more than lenders receive due to low utilization. Lotus\'s productive debt mechanism compresses this spread by ensuring idle supply earns treasury yields, so lenders earn even when their funds aren\'t actively borrowed.',
    example: 'If borrowers pay 5% but lenders only earn 3%, the borrow-lend spread is 2%.',
    related: ['spread', 'productive-debt', 'supply-rate', 'borrow-rate'],
  },

  'productive-debt': {
    term: 'Productive Debt (PD)',
    shortDef: 'Yield earned by idle supply from treasury-backed assets, even when not being borrowed.',
    fullDef: 'Productive debt (PD) is Lotus\'s mechanism where unborrowed funds continue earning yield. Unlike traditional lending where unborrowed funds earn nothing, Lotus backs its stablecoin with US Treasuries. This treasury yield flows to all lenders as a base rate, meaning your deposits earn yield even when utilization is low.',
    formula: 'PD Rate = Treasury Rate × Treasury Allocation',
    example: 'Treasury rate 4%, allocation 80% → PD base rate = 3.2% for all lenders',
    related: ['lotususd', 'spread', 'supply-rate'],
  },

  'connected-liquidity': {
    term: 'Connected Liquidity',
    shortDef: 'Liquidity shared across tranches, unlike isolated pools where each market is separate.',
    fullDef: 'In isolated lending pools, each market has its own liquidity that can\'t be shared. Lotus connects tranches so unused junior supply can support senior borrowers, and interest flows back down. This creates deeper markets and more efficient rates.',
    example: 'Unused 95% LLTV supply cascades up to support 75% LLTV borrowers if needed',
    related: ['cascade', 'tranche-seniority'],
  },

  'vault-manager': {
    term: 'Vault Manager',
    shortDef: 'A strategist who allocates vault deposits across tranches to optimize risk and yield.',
    fullDef: 'Vault managers make allocation decisions so depositors don\'t need to actively manage positions. They monitor market conditions, rebalance across tranches, and follow the vault\'s risk parameters. Depositors simply deposit and earn the blended yield.',
    example: 'A "Balanced" vault manager might allocate 30% to senior, 40% to mid, 30% to junior tranches',
    related: ['tranche-seniority'],
  },

  lotususd: {
    term: 'LotusUSD',
    shortDef: 'Lotus\'s loan asset, backed by USDC and US Treasuries.',
    fullDef: 'LotusUSD is the loan token used in Lotus Protocol. It\'s backed by a mix of USDC (for instant redemptions) and US Treasury bills (for yield generation). Users deposit and withdraw in USDC; the protocol converts to and from LotusUSD under the hood. The treasury portion generates the productive debt base rate that benefits all lenders.',
    example: '80% treasury allocation + 4% treasury rate = 3.2% base rate for all supply',
    related: ['productive-debt'],
  },

  'supply-rate': {
    term: 'Supply Rate',
    shortDef: 'The yield lenders earn on their deposits.',
    fullDef: 'Supply rate combines the productive debt base rate plus interest allocated through the cascade based on supply utilization at each tranche. In an isolated market, a simplified approximation is base rate + spread × utilization.',
    formula: 'Simplified (isolated market): Supply Rate = Productive Debt Rate + (Spread × Utilization)',
    related: ['borrow-rate', 'productive-debt', 'spread'],
  },

  'borrow-rate': {
    term: 'Borrow Rate',
    shortDef: 'The interest rate borrowers pay on their loans.',
    fullDef: 'Borrow rate is determined by the Interest Rate Model (IRM) based on borrow utilization. In Lotus, the total borrow rate is the productive debt base rate plus the credit spread.',
    formula: 'Borrow Rate = Productive Debt Rate + Credit Spread',
    related: ['supply-rate', 'productive-debt', 'spread'],
  },

  collateral: {
    term: 'Collateral',
    shortDef: 'Assets you deposit to secure a loan — seized if you can\'t repay.',
    fullDef: 'Collateral is your security deposit when borrowing. You deposit valuable assets (like wstETH) and can borrow against a percentage of their value. If your collateral value drops too much relative to your debt, it can be liquidated.',
    example: 'Deposit $10,000 wstETH as collateral to borrow up to $8,000 LotusUSD at 80% LLTV',
    related: ['lltv', 'liquidation'],
  },

  leverage: {
    term: 'Leverage',
    shortDef: 'Borrowing to amplify your position — higher LLTV = more leverage.',
    fullDef: 'Leverage lets you control a larger position than your capital alone would allow. At 80% LLTV, you can achieve 5x leverage (1 / (1 - 0.80) = 5). Higher leverage amplifies both gains and losses.',
    formula: 'Max Leverage = 1 / (1 - LLTV)',
    example: '75% LLTV = 4x max leverage, 95% LLTV = 20x max leverage',
    related: ['lltv', 'liquidation'],
  },
};

export function getGlossaryEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key];
}

export function getGlossaryTerms(): string[] {
  return Object.keys(GLOSSARY);
}
