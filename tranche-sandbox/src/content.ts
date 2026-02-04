import type { Section } from './components/Sidebar';

// ============================================
// Section Metadata (from App.tsx)
// ============================================

export const sectionMeta: Record<
  Section,
  {
    title: string;
    headline: string;
    subtitle: string;
    transitionText?: string;
    next?: { id: Section; label: string };
  }
> = {
  intro: {
    title: 'Get Started',
    headline: 'Welcome to Lotus',
    subtitle: 'Understand how Lotus delivers better rates through connected liquidity',
    transitionText: "Let's start with the foundation: how LotusUSD backing creates lower rates...",
    next: { id: 'lotususd', label: 'Stable Backing' },
  },
  lotususd: {
    title: 'Stable Backing',
    headline: 'LotusUSD & Productive Debt',
    subtitle: 'Every dollar supplied earns yield, even when not borrowed',
    transitionText: "Now let's see what that base rate unlocks for borrowers...",
    next: { id: 'borrower-benefits', label: 'Borrower Outcomes' },
  },
  'borrower-benefits': {
    title: 'Borrower Outcomes',
    headline: 'Better Borrowing, By Design',
    subtitle: 'Low predictable rates or more borrowing power — your choice',
    transitionText: 'Next up: how tranches layer risk and rewards across the market.',
    next: { id: 'risk', label: 'Risk Layers' },
  },
  risk: {
    title: 'Risk Layers',
    headline: 'Understanding Tranche Risk',
    subtitle: 'A higher LLTV means higher risk for lenders — and higher potential returns',
    transitionText: "With risk understood, let's see how liquidity connects tranches...",
    next: { id: 'tranches', label: 'Liquidity Flow' },
  },
  tranches: {
    title: 'Liquidity Flow',
    headline: 'Connected Liquidity',
    subtitle: 'Unused liquidity flows across tranches, maximizing efficiency while maintaining risk segmentation',
    transitionText: "Interest flows through these tranches. Let's trace it...",
    next: { id: 'interest-bad-debt', label: 'Interest & Losses' },
  },
  'interest-bad-debt': {
    title: 'Interest & Losses',
    headline: 'Interest Cascade & Bad Debt',
    subtitle: 'Risk and reward stay aligned as interest and losses flow through across tranches',
    transitionText: 'Now you understand how the protocol works. Ready to choose your strategy?',
    next: { id: 'vaults', label: 'Your Strategy' },
  },
  vaults: {
    title: 'Your Strategy',
    headline: 'Choose Your Allocation',
    subtitle: 'Select a vault tailored to your risk tolerance and goals',
    transitionText: 'Need a quick reference? Review the key terms and formulas.',
    next: { id: 'glossary', label: 'Glossary' },
  },
  glossary: {
    title: 'Glossary',
    headline: 'Key Terms & Formulas',
    subtitle: 'Search definitions, formulas, and examples across the protocol',
  },
};

// ============================================
// Page Content
// ============================================

export const content = {
  // ------------------------------------------
  // Introduction Page
  // ------------------------------------------
  intro: {
    pageHeader: {
      whatYoullLearn: [
        'What Lotus solves for DeFi lending',
        'How tranches create different risk/reward options',
        'Why connected liquidity beats isolated markets',
      ],
    },
    lotusDifference: {
      heading: 'The Lotus Difference',
      features: [
        {
          title: 'Risk-Tiered Tranches',
          description: 'Lenders choose their risk exposure across senior and junior tranches.',
          lenderNote: 'Senior tranches offer safety; junior tranches offer higher yield.',
          borrowerNote: 'Senior tranches offer more stable rates and deeper liquidity; junior tranches offer higher leverage and lower liquidation prices.',
        },
        {
          title: 'Connected Liquidity',
          description: 'Liquidity and information are shared across tranches, creating deeper, more efficient markets.',
        },
        {
          title: 'Productive Debt',
          description: 'Unutilized capital earns yield from treasury-backed assets, compressing borrow-lend spreads.',
        },
      ],
    },
    vaultsPreview: {
      heading: 'Vaults',
      description: "Most lenders participate through vaults — curated strategies that allocate across tranches. We'll cover vaults after you understand how tranches work.",
    },
  },

  // ------------------------------------------
  // Protocol Explainer (within Introduction)
  // ------------------------------------------
  protocolExplainer: {
    problem: {
      badge: 'The Problem',
      heading: 'Why Isolated Markets Break',
      intro: [
        'Traditional lending markets force everyone into a single set of risk parameters. ' +
        'When collateral risk rises, the market responds with higher interest rates. ' +
        'This forces conservative lenders into taking on added risk. Conservative borrowers end up subsidizing the aggressive ones. ', 
        'The naive solution is to have multiple markets with different. Unfortunately, this fragments liquidity. ' +
        'In practice, isolated markets find one equilibrium risk setting per lending pair. ' + 
        'On volatile markets, the parameters are conservative. On correlated markets, they are aggressive. ',
        'As a result, the only way to get high-yield with isolated markets, is to lend against risky correlated asset pairs. ' +
        'This results in high-yield with high amounts of opaque tail risk.'
      ],
      points: [
        {
          title: 'Isolated Market Baseline',
          copy: 'In a single isolated market, one risk configuration means everyone shares the same terms.',
        },
        {
          title: 'Risk Curve',
          copy: 'As the liquidation loan-to-value ratio rises, the risk of bad debt increases and interest rates should rise with it.',
        },
        {
          title: 'Risk Is Not Static',
          copy: 'Collateral risk shifts over time, but isolated markets keep LLTV fixed, creating rate volatility.',
        },
        {
          title: 'Borrower Subsidy Problem',
          copy: 'All borrowers pay the same rate even when their risk levels differ.',
        },
        {
          title: 'Borrower That Cannot Exist',
          copy: 'A single LLTV cap excludes higher-leverage borrowers entirely.',
        },
        {
          title: 'Risk Migration',
          copy: 'Risk-seeking lenders move to riskier collateral markets in search of higher yield.',
        },
      ],
      learnMoreUrl: 'https://www.lotuslabs.net/blog/introducing-lotus',
    },
    solution: {
      badge: 'The Solution',
      heading: 'Lotus Protocol',
      overview: [
        'Lotus is an onchain lending protocol that lets lenders and borrowers meet on a risk curve inside a single market. Instead of creating separate pools for every risk setting, Lotus uses tranches to offer multiple risk levels while keeping liquidity connected.',
        'A market contains multiple tranches ordered by risk (senior to junior). Unused liquidity from junior tranches can support more senior borrowers. This keeps markets deep without forcing everyone into the same risk profile.',
        'The Lotus flagship markets order tranches by liquidation loan-to-value (LLTV) threshold. Higher LLTV tranches (junior) carry higher risk for lenders, but earn higher yields.',
      ],
      terminologyNote: {
        title: 'A Note on Terminology',
        paragraphs: [
          'Lotus uses the terms "junior" and "senior" differently than traditional finance. ' +
          'In conventional debt structures, seniority refers to payment priority—senior creditors are repaid before junior creditors, and junior creditors absorb losses first.',
          'In Lotus, these terms refer to the relative riskiness of a tranche for lenders. A junior tranche has a higher LLTV threshold, meaning lenders there are willing to back riskier loans. ' +
          'A senior tranche has a lower LLTV threshold, serving only borrowers with more conservative collateral ratios. ' +
          'The distinction is about which risk parameters a lender accepts, not about who gets paid first.',
          'When junior capital cascades to senior tranches, it is treated equally with capital supplied directly there. ' +
          'Interest earned and losses absorbed are allocated proportionally based on actual exposure, not based on where the capital originated. ' +
          'Junior lenders do not automatically absorb losses before senior lenders; both absorb losses in proportion to their share of the liquidity backing a given tranche.',
          'This proportional treatment applies throughout the system. Readers familiar with traditional capital stack logic should set aside those assumptions before proceeding.',
        ],
      },
      interestNote: 'Interest and loss allocation follow the tranche structure, so risk and reward stay aligned.',
      lotusUSD: {
        heading: 'LotusUSD',
        description: 'In USD-denominated Lotus markets, the loan asset is LotusUSD. LotusUSD is a vault token backed by USDC and tokenized short-term US Treasuries. Its goal is to earn a rate that is close to the risk-free rate on deployed assets while maintaining onchain liquidity. Using a yield-bearing token as the loan asset is called "productive debt".',
      },
    },
  },

  // ------------------------------------------
  // Productive Debt Page
  // ------------------------------------------
  productiveDebt: {
    intro: {
      heading: 'Benefits of Productive Debt',
      benefits: [
        {
          title: 'Minimum Rate for Lenders',
          description: 'Lenders earn at least the base rate from productive assets, even when utilization is low.',
        },
        {
          title: 'Spread Compression',
          description: 'The gap between borrow and supply rates narrows, creating a more efficient market.',
        },
        {
          title: 'Volatility Reduction',
          description: 'The IRM only prices the spread, not the base rate — resulting in smaller rate swings.',
        },
      ],
    },
    rateComposition: {
      heading: 'Borrow Rate Composition',
      description: 'With productive debt, the borrow rate decomposes into a base component (from productive assets) plus a spread component (set by the market).',
      baseRateLabel: 'Base Rate',
      baseRateSource: 'from LotusUSD',
      creditSpreadLabel: 'Credit Spread',
      creditSpreadSource: 'market-determined',
      borrowRateLabel: 'Borrow Rate',
      borrowRateSource: 'total rate',
    },
    spreadCompression: {
      heading: 'Spread Compression',
      whatIs: {
        heading: 'What is Spread Compression?',
        description: 'The borrow-lend spread is the gap between what borrowers pay and what lenders earn. The credit spread is the additional rate set by the Interest Rate Model (IRM) on top of the base rate. In traditional markets, when utilization is low, this gap is large because idle capital earns nothing.',
      },
      whyMatters: {
        heading: 'Why Does It Matter?',
        description: 'Productive debt (PD) compresses this spread by ensuring idle liquidity earns the base rate. This means better rates for both sides: borrowers pay less, and lenders earn more — especially when utilization is low.',
      },
      utilizationLabel: 'Borrow Utilization',
      utilizationNote: 'Lower utilization = bigger PD advantage.',
      efficiencySplitLabel: 'Efficiency Split',
      efficiencySplitNote: 'How efficiency gains are distributed.',
      zeroUtilizationNote: 'At 0% utilization, lenders still earn the base rate in LotusUSD markets. Traditional lending: supply rate = 0%.',
      chartTitle: 'Comparing Productive Debt vs. Non-Productive Debt',
      spreadEfficiency: {
        label: 'Spread Efficiency',
        description: 'How much tighter the borrow-lend spread is with PD',
      },
    },
    volatilityReduction: {
      heading: 'Volatility Reduction',
      description: 'The IRM only prices the spread, not the base rate. This means rate swings are proportionally smaller with productive debt.',
      withoutPdRange: 'Without PD Range',
      withPdRange: 'With PD Range',
      volatilityReduced: 'Volatility Reduced',
      volatilityReducedNote: 'smaller rate swings',
    },
    keyTakeaway: 'Productive debt compresses the borrow-lend spread most when utilization is low, because idle supply still earns the base rate.',
  },

  // ------------------------------------------
  // Tranche Liquidity Page
  // ------------------------------------------
  trancheLiquidity: {
    pageHeader: {
      whatYoullLearn: [
        'How lenders and borrowers interact with different tranches',
        'Why liquidity cascades from junior to senior and interest cascades from senior to junior',
        'How the dynamic loan mix shows who is lending to whom',
      ],
      tryThis: 'Adjust the supply and borrow values in the table below to see how liquidity flows between tranches.',
    },
    roleCards: {
      heading: 'How Lenders & Borrowers Use Tranches',
    },
    cascadeBenefits: {
      heading: 'Benefits of Cascading Liquidity',
      description: 'Unlike isolated pools, Lotus tranches share liquidity through a cascade mechanism while keeping risk segmented.',
      cards: [
        {
          title: 'Capital Efficiency',
          description: 'Unused junior supply supports senior borrowers, improving overall efficiency.',
        },
        {
          title: 'Fair Distribution',
          description: 'Interest flows to all suppliers whose liquidity was used, proportionally.',
        },
        {
          title: 'Higher Risk = Higher Yield',
          description: 'Junior lenders underwrite higher-risk LLTVs and earn higher yields to compensate.',
        },
      ],
      howItWorks: {
        heading: 'How Cascading Liquidity Works',
        steps: [
          {
            label: 'Liquidity cascades from junior to senior:',
            description: 'Unused supply from junior tranches (higher LLTV) supports more senior borrowers (lower LLTV).',
          },
          {
            label: 'Interest cascades from senior to junior:',
            description: 'Interest generated at senior tranches flows to junior tranches based on supply utilization at each level.',
          },
          {
            label: 'No idle capital:',
            description: 'Your supply earns yield even when borrowers at your tranche level are quiet, because it can support senior borrowers.',
          },
        ],
      },
      badDebtNote: 'Bad debt is allocated proportionally to lenders who provided the liquidity that was borrowed. Junior lenders earn higher yields because they underwrite riskier (higher LLTV) loans, not because they "absorb losses first."',
    },
    keyTakeaway: 'Connected liquidity keeps senior markets deep while keeping risk separated across tranches.',
    tableGuide: {
      title: 'How to Read This Table',
      intro: 'This table shows how liquidity flows across tranches in a single market. Tranches are ordered from senior (lower LLTV, lower risk) to junior (higher LLTV, higher risk).',
      columns: [
        {
          name: 'LLTV',
          description: 'The liquidation loan-to-value threshold. Borrowers at this tranche can borrow up to this percentage of their collateral value before becoming liquidatable.',
        },
        {
          name: 'Supply',
          description: 'The amount lenders have deposited directly into this tranche. This is an input you can edit.',
        },
        {
          name: 'Borrow',
          description: 'The amount borrowers have borrowed at this tranche (i.e., at this LLTV). This is an input you can edit.',
        },
        {
          name: 'Credit Spread',
          description: 'The interest rate premium set by the Interest Rate Model (IRM) based on borrow utilization. Higher utilization means higher spreads.',
        },
        {
          name: 'Borrow Rate',
          description: 'The total rate borrowers pay: Productive Debt Rate (base) + Credit Spread. This is what borrowers owe on their loans.',
        },
        {
          name: 'Jr Supply',
          description: 'Junior Supply — the total supply at this tranche plus all more junior tranches. This liquidity can support borrowers at this tranche or any more senior tranche.',
        },
        {
          name: 'Jr Borrow',
          description: 'Junior Borrow — the total borrow demand at this tranche plus all more junior tranches.',
        },
        {
          name: 'Jr Net',
          description: 'Junior Net Supply = Jr Supply − Jr Borrow. This must always be positive in a valid market state. It represents excess liquidity that can flow to more senior tranches, but does not account for existing borrow demand at senior tranches already utilizing that liquidity. Free Supply accounts for that.',
        },
        {
          name: 'Free Supply',
          description: 'The actual liquidity available to borrow or withdraw at this tranche. Equals the minimum Jr Net Supply across this tranche and all more senior tranches. This is the binding constraint on new borrows.',
        },
        {
          name: 'Available',
          description: 'Available Supply = Jr Net Supply + Borrows at this tranche. Represents the total supply that could be accessed by borrowers at this tranche if all existing borrows were repaid.',
        },
        {
          name: 'Supply Util',
          description: 'Supply Utilization = Supply / Available Supply. Determines how much interest stays at this tranche versus cascading to more junior tranches.',
        },
        {
          name: 'Borrow Util',
          description: 'Borrow Utilization = 1 − (Free Supply / Jr Supply). This drives the IRM: higher borrow utilization leads to higher credit spreads and borrow rates.',
        },
        {
          name: 'Supply Rate',
          description: 'The rate lenders earn at this tranche: Productive Debt Rate (base) + interest allocated through the cascade based on supply utilization.',
        },
      ],
      tips: [
        'Click any row to inspect the constraint details for that tranche.',
        'A blue dot next to Borrow indicates the tranche is borrowing more than its direct supply — this is normal, as it draws from junior liquidity.',
        'An amber-highlighted row indicates this tranche has the binding (tightest) Jr Net Supply constraint.',
        'A red-highlighted row indicates an invalid state where borrow exceeds available liquidity.',
      ],
    },
    juniorMetrics: {
      title: 'Understanding Junior Metrics',
      description: 'How supply and borrow cascade across tranches',
      juniorSupply: {
        heading: 'Junior Supply',
        description: 'Junior supply is the total supply available at this tranche plus every more junior tranche. It shows how much liquidity sits "below" this level.',
        directLegend: 'Direct supply (this tranche)',
        cascadedLegend: 'Cascaded from junior',
      },
      juniorBorrow: {
        heading: 'Junior Borrow',
        description: 'Junior borrow is the total borrow demand at this tranche and all more junior tranches. It shows how much risk demand piles up below this level.',
        directLegend: 'Direct borrow (this tranche)',
        cascadedLegend: 'Cascaded from senior',
      },
      juniorNetSupply: {
        heading: 'Junior Net Supply',
        description: 'Junior net supply is junior supply minus junior borrow. It shows the excess liquidity at each level that can flow to more senior borrowers.',
      },
    },
    supplyMetrics: {
      title: 'Understanding Supply Metrics',
      description: 'Free Supply and Available Supply explained',
      freeSupply: {
        heading: 'Free Supply',
        description: 'The amount of liquidity that can be borrowed or withdrawn from the tranche.',
        formula: 'FreeSupply = min(JrNetSupply at this tranche and all more senior tranches)',
        note: 'Free supply is constrained by the minimum Jr Net Supply at all more senior tranches. Even if a junior tranche has excess liquidity, it can only be withdrawn if senior tranches also have liquidity available.',
        whyButton: {
          heading: 'Why Free Supply Matters',
          explanation: 'Free supply is the amount that can be borrowed or withdrawn from a tranche.',
          detail: "It's limited by the tightest junior net supply along the senior path. Even if a junior tranche has lots of liquidity, it can only be accessed if all senior tranches also have liquidity available.",
          borrowNote: 'Why can borrow > supply? This is valid because liquidity cascades from junior tranches. The true limit is Free Supply, not direct supply.',
        },
      },
      availableSupply: {
        heading: 'Available Supply',
        description: 'The total supply available for borrowers at this tranche. Equals Jr Net Supply plus existing borrows at the tranche.',
        formula: 'AvailableSupply = JrNetSupply + BorrowsAtTranche',
      },
    },
    utilizationMetrics: {
      title: 'Utilization Metrics',
      description: 'How supply and borrow utilization are calculated',
      supplyUtil: {
        heading: 'Supply Utilization by Tranche',
        note: 'Supply utilization determines how much interest stays at this tranche vs cascading to more junior tranches. Higher supply utilization means more of the interest is kept at this level.',
      },
      borrowUtil: {
        heading: 'Borrow Utilization by Tranche',
        note: 'Borrow utilization is used to determine interest rates according to the Interest Rate Model (IRM). Higher utilization leads to higher borrow rates.',
      },
    },
    failureMode: {
      title: 'Stress Scenario: Withdrawal Limits',
      description: 'Free Supply determines how much can be withdrawn instantly. There is no withdrawal queue—if Free Supply is insufficient, lenders must wait until borrowers repay loans or new supply enters the system. Junior lenders are particularly affected as their Free Supply depends on senior tranches maintaining liquidity buffers.',
    },
  },

  // ------------------------------------------
  // Borrower Benefits Page
  // ------------------------------------------
  borrowerBenefits: {
    pageHeader: {
      whatYoullLearn: [
        'How to choose a tranche for your borrowing goals',
        'How higher LLTVs unlock more borrowing power, higher leverage, and lower liquidation prices',
        'Why senior borrowers get more stable rates and deeper liquidity',
      ],
      tryThis: 'Choose a tranche by trading off borrow rate and liquidation price.',
    },
    borrowExperience: {
      heading: 'Borrow Experience',
      description: 'Higher LLTV tranches unlock more borrowing power. Senior borrowers can access deeper liquidity because junior supply cascades from junior to senior.',
    },
    overMaxMessage: (lltv: number) => `Over the max borrow for ${lltv}% LLTV. Choose a higher LLTV or reduce borrow.`,
    maxBorrowMessage: (lltv: number, maxBorrow: string) => `Max borrow at ${lltv}% LLTV: $${maxBorrow}`,
    loanDenominationNote: 'Loan balances are denominated in LotusUSD. USDC conversion happens automatically.',
    healthFactorNote: 'Tranches that would put your health factor below 1.05 are disabled. In this simulator, health factor below 1.0 means LTV exceeds the tranche LLTV (liquidation threshold); 1.05 is a safety buffer.',
    keyTakeaway: 'Lower LLTV generally means lower, more stable rates. Higher LLTV offers more borrowing power and leverage and a lower liquidation price.',
  },

  // ------------------------------------------
  // Tranche Risk Page
  // ------------------------------------------
  trancheRisk: {
    pageHeader: {
      whatYoullLearn: [
        'How liquidations protect lenders',
        'Why higher LTV means higher risk for lenders and higher potential returns',
        'How risk level connects to the spread lenders earn',
      ],
    },
    liquidationsAndRisk: {
      heading: 'Liquidations & Risk',
      description: 'When a borrower\'s LTV exceeds the tranche LLTV, liquidators seize collateral and repay debt. Higher LLTV tranches have less buffer, meaning bad debt occurs sooner—so they pay higher spreads.',
      riskChain: {
        higherLltv: 'Higher LLTV',
        lessBuffer: 'Less Buffer',
        moreRisk: 'More Risk',
        higherSpread: 'Higher Spread',
      },
      tableHeaders: {
        tranche: 'Tranche',
        buffer: 'Buffer',
        liqBonus: 'Liq. Bonus',
        badDebtAfter: 'Bad Debt After',
        risk: 'Risk',
      },
      exampleTitle: (lltv: number) => `Example: Liquidation at ${lltv}% LLTV`,
      badDebtFormula: {
        label: 'Bad debt starts after:',
        formulaNote: 'This assumes the loan\'s health factor is 1 (at the liquidation threshold) and that gas conditions enable a profitable liquidation. In practice, oracle lag or high gas costs may delay liquidations, increasing bad debt risk.',
      },
      technicalDetails: 'Technical Details',
      lifNote: 'Higher LLTV = less collateral buffer = less room for liquidation bonus. This is why junior tranches have lower bonus and higher bad debt risk.',
    },
    failureMode: {
      title: 'Stress Scenario: Oracle Lag & Liquidation Delays',
      description: 'In volatile markets, oracle price updates may lag behind actual market prices. If collateral value drops faster than oracles report, positions may become undercollateralized before liquidators can act. Additionally, high gas prices during market stress can make small liquidations unprofitable, especially for junior tranches with lower liquidation bonus. This delay increases the risk of bad debt formation.',
    },
    simplifiedNote: 'Simplified model for educational purposes. Actual liquidation modules have additional parameters.',
  },

  // ------------------------------------------
  // Vaults Page
  // ------------------------------------------
  vaults: {
    pageHeader: {
      whatYoullLearn: [
        'How vaults aggregate deposits and allocate across tranches',
        'The tradeoffs between conservative and boost strategies',
        'How expected APY and risk score relate to allocation',
      ],
      tryThis: 'Click each strategy card below to compare their allocations, APY, and risk profiles.',
    },
    launchMarkets: {
      heading: 'Launch Markets',
      badge: 'Genesis',
    },
    howVaultsWork: {
      heading: 'How Vaults Work',
      steps: [
        {
          title: '1. Deposit',
          description: 'Users deposit USDC into a vault and receive vault shares representing their position.',
        },
        {
          title: '2. Allocate',
          description: "Vault manager allocates deposits across tranches based on the vault's strategy.",
        },
        {
          title: '3. Earn Yield',
          description: 'Interest earned accrues to the vault. Vault shares appreciate in value over time.',
        },
      ],
      withdrawalWarning: 'Withdrawals can be constrained when assets are deployed across tranches. If liquidity is tight, users may need to wait for borrows to unwind or for new supply to enter.',
      flowDiagram: {
        userDeposit: 'User Deposits USDC',
        autoConverted: 'Auto-converted to LotusUSD',
        vault: 'Vault',
        aggregates: 'Aggregates all deposits',
        vaultManager: 'Vault Manager',
        allocates: 'Allocates across tranches',
        seniorLabel: 'Senior (Lower Risk)',
        juniorLabel: 'Junior (Higher Yield)',
        footnote: 'Users deposit and withdraw in USDC. The vault and protocol account in LotusUSD under the hood (the loan asset).',
      },
    },
    strategies: {
      heading: 'Allocation Strategies',
      description: 'Vault managers choose strategies based on risk tolerance. Click a strategy to see its allocation breakdown.',
      conservative: {
        name: 'Conservative',
        description: 'Prioritizes capital preservation with majority allocation to senior tranches.',
      },
      balanced: {
        name: 'Balanced',
        description: 'Balanced exposure across tranches for moderate risk/reward.',
      },
      boost: {
        name: 'Boost',
        description: 'Targets higher yield with increased junior tranche exposure.',
      },
    },
    breakdownTitle: (strategy: string) => `${strategy} Strategy Breakdown`,
    breakdownSubtitle: 'Allocation across tranches',
    insights: {
      highRisk: 'High Risk Allocation: With a risk score above 7, this strategy concentrates heavily in junior tranches. While yields are higher, these tranches absorb losses first during bad debt events.',
      conservative: 'Conservative Approach: This allocation prioritizes capital preservation. Senior tranches have larger liquidation buffers and are last to absorb bad debt.',
    },
    expectedApyLabel: 'Expected APY',
    expectedApyNote: 'Weighted average of tranche supply rates based on your allocation',
    riskScoreLabel: 'Risk Score',
    riskLabels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
  },

  // ------------------------------------------
  // LotusUSD Allocation Page
  // ------------------------------------------
  lotusUSDAllocation: {
    intro: 'LotusUSD is a yield-bearing vault token backed by USDC and short-term Treasuries. Its yield becomes the market\'s base rate, allowing idle liquidity to earn yield even when not being borrowed.',
    presets: {
      label: 'Presets:',
      typical: 'Typical (80% @ 4%)',
      highYield: 'High Yield (95% @ 5%)',
      highLiquidity: 'High Liquidity (50% @ 3.5%)',
    },
    inputs: {
      heading: 'Inputs',
      treasuryAllocation: 'Treasury Allocation',
      treasuryRate: 'US Treasury Rate',
      treasuryRateDescription: 'Current yield on US Treasury bills',
    },
    output: {
      heading: 'Output',
      productiveDebtRate: 'Productive Debt Rate',
    },
    allocationPresets: [
      { value: 0.1, label: 'Liquidity-first', description: 'Low treasury exposure, maximum liquidity' },
      { value: 0.5, label: 'Balanced', description: 'Equal USDC and Treasury allocation' },
      { value: 0.8, label: 'Yield-first', description: 'Higher treasury exposure for yield' },
      { value: 0.95, label: 'Max yield', description: 'Maximum treasury exposure' },
    ],
    sliderLabels: {
      min: '0% (All USDC)',
      mid: '50%',
      max: '100% (All Treasuries)',
    },
    pieChart: {
      title: 'LotusUSD Allocation',
      usdcLabel: 'USDC',
      treasuriesLabel: 'Treasuries',
    },
    tradeoffNote: 'The percentage allocated to Treasuries will vary depending on market conditions. It is designed to maintain sufficient instantaneous market liquidity while maximizing the percentage allocated to Treasuries.',
    insights: {
      maxTreasury: 'Maximum Treasury Exposure: At near-100% treasury allocation, the productive debt rate equals the full treasury rate. However, this leaves minimal USDC reserves for instant redemptions.',
      minTreasury: 'Minimal Yield: With treasury allocation near 0%, the productive debt rate approaches zero. All backing is in USDC which earns no yield, but provides maximum liquidity for redemptions.',
    },
    howItWorks: {
      heading: 'How It Works',
      usdcReserve: {
        title: 'USDC Reserve',
        description: 'Held as instant liquidity for redemptions. Earns 0% yield but provides stability.',
      },
      treasuryHoldings: {
        title: 'Treasury Holdings',
        description: 'Invested in US Treasury bills to generate yield for the productive debt base rate.',
      },
      productiveDebtRate: {
        title: 'Productive Debt Rate',
        description: 'The rate earned by idle supply. Used in the next section to compress spreads.',
      },
    },
  },
};

export default content;
