# Lotus Protocol — Copy & Brand Context

Use this file as the source of truth for all copy, labels, and messaging in the interactive docs.

---

## What Lotus Is (one sentence, scaled by depth)

- **Cold:** Lotus is a tranched DeFi credit market.
- **Curious:** Lotus is a tranched DeFi credit market that powers vaults, using connected tranches to deliver higher yields on high-quality collateral.
- **Engaged:** Today, conservative vaults lend against blue-chips at boring yields. "High-yield" vaults lend against correlated collateral that could blow up. There's very little in between. We built a credit engine that lets vaults target a wider spectrum of risk and return on collateral you actually want to hold long-term.

For this tool, write at the **curious** level. Assume the reader has DeFi context but doesn't know Lotus specifically.

---

## The Core Problem

DeFi credit forces a bad tradeoff:

- **Pooled markets** (Aave): Blended pricing, risk opaque. You can't choose your exposure — you just get the average.
- **Isolated markets** (Morpho Blue): You can choose your exposure, but liquidity fragments. Only the extremes attract enough depth — the middle dies.

Neither lets allocators size risk like credit professionals actually do.

## The Solution

One market, ordered tranches. Capital moves across the curve — depth concentrates while risk tiers stay explicit.

**Key mechanics:**
- **Tranches** = atomic credit units (loan asset + collateral + LLTV + oracle)
- **Cascading liquidity** = unutilized supply flows to senior tranches automatically
- **Productive debt** = idle capital at the senior-most tranche earns yield-bearing assets (creates a yield floor)
- **Risk curve** = borrower-lender interactions form dynamic pricing by risk tier

---

## Audiences (who reads this tool)

### Primary: Vault Managers / Risk Managers
What they need: Compete on credit strategy and risk premia, not just asset curation. Better infrastructure than running on Morpho/Aave.

### Secondary: Allocators / Institutional LPs
What they need: Yield that reflects the risk they're actually taking, on collateral they'd actually want to own.

### Tertiary: Borrowers
What they need: Pay for actual risk, not blended average. Choose their tranche. Lower rates at equivalent risk.

---

## Value Proposition

**Onchain risk you can actually underwrite.**

### Three Benefits (use these as the backbone for section copy)

1. **Earn high yields on high quality collateral.** What's inside your vault matters. Lotus lets you earn yield that reflects the risk you're actually taking — on collateral you'd actually want to own.

2. **Know exactly what has to break.** Every vault maps to explicit tranches with visible loss absorption. You see the collateral, the tranches, and what eats losses first.

3. **Pick your place on the risk curve.** Other protocols give you two choices: boring yields on blue-chips, or high-yield vaults full of junk collateral. Lotus connects liquidity across risk tiers so the full spectrum actually exists.

---

## Vault Tiers

| Vault | Label | Risk Band | Description |
|-------|-------|-----------|-------------|
| Core | Core Credit | Senior-first, lowest tail risk | ≤10% junior cap |
| Balanced | Balanced Credit | Middle risk, explicit junior buffer | ≤30% junior cap |
| Boost | Boost Credit | Junior-tilted, highest tail risk | ≤70% junior cap |

Each tier maps to explicit tranche bands. Not separate pools — slices of the same connected market.

---

## Competitive Frame

**1 → 2 → ∞**

1. Aave: One market, one risk profile. Simple but no choice.
2. Morpho: Externalized risk management, but isolated markets fragment liquidity.
3. Lotus: Connected tranches. The full spectrum exists.

Always credit the progression. The critique is structural, not dismissive.

---

## Tone Rules

- **Outcome before mechanism.** Lead with what the user gets, then explain how.
- **Professional but not corporate.** Technical sophistication without jargon overload.
- **Confident without hype.** No "revolutionary." No vague superlatives.
- **Problem → solution framing.** Always ground features in the problem they solve.
- **Concise.** One sentence where one sentence works. Cut filler.

### Words to use
- Tranches, risk curve, connected liquidity, cascading, productive debt, yield floor, explicit risk, loss absorption

### Words to avoid
- Revolutionary, game-changing, next-gen, unlock (overused), disrupting
- "First-loss waterfall" for junior tranches (losses are proportionally allocated, not hierarchically absorbed)
- Mechanism-first jargon before establishing the outcome

---

## Brand Typography

- **Headings:** Neue Machina Inktrap (Regular). Letter spacing -3% at display sizes, 130% line height.
- **Body:** Neue Montreal (Regular, Light, Medium). 130% line height.

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Dark Purple | #280B55 | Backgrounds, depth |
| Dark Grey | #0D0A14 | Main background |
| Light Purple | #8E62FF | Primary accent, interactive elements |
| Light Grey | #F2F0F6 | Light surfaces |
| Grey 100 | #FBFAFC | Headings |
| Grey 300 | #D4D0DD | Body text |
| Grey 500 | #736D7F | Muted/secondary text |
