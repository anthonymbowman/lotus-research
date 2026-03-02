# Lotus Interactive Docs - Project Guidelines

## Design System

### Colors

#### Brand Color
Purple is the core brand color:
- Purple-50: #F3F1FF
- Purple-100: #EDE9FF
- Purple-200: #DED6FF
- Purple-300: #C4B2FF
- Purple-400: #A385FB
- Purple-500: #8E62FF
- Purple-600: #7E3EF5
- Purple-700: #6C15E4
- Purple-800: #5711BE
- Purple-900: #3F1C85
- Purple-950: #280B55

#### Credit Rating Colors (Risk Spectrum)
Use these for risk-related visualizations. Ordered from safest to riskiest:
- A+ (safest): #2FFAE2 (teal)
- A: #6BF4A0 (green)
- B+: #B0ED83 (lime)
- B: #EBE283 (yellow)
- C+: #FFA5CD (pink)
- C: #E764FA (magenta)
- D (default/riskiest): #FE3E38 (red)

#### Color Usage Guidelines
- Avoid arbitrary blues, oranges, greens - use risk colors instead where appropriate
- Lenders: treat as safer end of spectrum (A+, A, B+)
- Borrowers: treat as riskier end of spectrum (B, C+, C) but not D/default
- Risk levels should correlate to what they represent (e.g., senior tranches = safer colors, junior tranches = riskier colors)
- Maintain logical consistency (e.g., if borrowers are orange/risky in one place, keep that throughout)

#### Gray Lines
- Gray lines/borders should use `lotus-grey-700`

### Corner Radius
Corner rounding is deterministic. Only use 0px, 1px, 2px (in Tailwind: `rounded-none`, `rounded-sm`, `rounded`).

Assign radius by role:
- **Main structural frames** = 0px (`rounded-none`)
- **Nested grouping surfaces/cards** = 2px (`rounded`)
- **Interior controls/affordances** = 1px (`rounded-sm`)

Never use any other radius values (`rounded-lg`, `rounded-xl`, `rounded-2xl`, etc.).
When unsure, default to 0px.
