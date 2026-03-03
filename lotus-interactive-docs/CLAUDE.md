# Lotus Interactive Docs - Project Guidelines

## Design System

### Typography

**Display Font (Headings):** PP Neue Machina Inktrap
- Weights: Light (300), Regular (400), Medium (500), Ultrabold (700)
- Use for: h1, h2, h3, h4, section titles

**Body Font:** PP Neue Montreal
- Weights: Book (400), Regular (450), Medium (500), Bold (700)
- Use for: body text, paragraphs, labels, descriptions

**Mono Font:** Roboto Mono
- Use for: code, numbers, technical values

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

**Exception:** `rounded-full` is acceptable for small circular indicators (dots, status lights).

### Spacing System

Use consistent spacing values. Both numeric Tailwind values and semantic tokens are available:

| Token | Value | Tailwind | Use Case |
|-------|-------|----------|----------|
| xs | 4px | p-1, gap-1 | Tight internal spacing, inline elements |
| sm | 8px | p-2, gap-2 | Small gaps, badge padding |
| md | 12px | p-3, gap-3 | Default internal padding, list items |
| lg | 16px | p-4, gap-4 | Card padding, medium gaps |
| xl | 24px | p-6, gap-6 | Section spacing, modal padding |
| 2xl | 32px | p-8, gap-8 | Large section gaps |
| 3xl | 48px | p-12, gap-12 | Page-level spacing |

**Guidelines:**
- **Container padding:** `p-4` (cards), `p-6` (sections), `p-8` (main wrappers)
- **Internal gaps:** `gap-2` (tight), `gap-3` (default), `gap-4` (spacious)
- **Section spacing:** `space-y-6` or `space-y-8` for vertical rhythm
- **Inline elements:** `gap-1` or `gap-2` for icons/text combos
- **Margin between sections:** `mb-6` or `mb-8`

**Avoid:** Non-standard values like `p-7`, `gap-5`, `p-10` unless necessary.

### Transitions

Use consistent transition timing:
- **Standard:** `transition-colors` or `transition-all` (200ms default)
- **Animations:** 0.3s ease-out for fade/slide animations

### Container Hierarchy

Visual depth through background colors:
1. **Page background:** `bg-lotus-grey-900`
2. **Main containers:** `bg-lotus-grey-950` with `border-lotus-grey-700`
3. **Nested cards:** `bg-lotus-grey-900` or `bg-lotus-grey-800` with `border-lotus-grey-700`

For subtle nested containers, use `border-lotus-grey-700/50` to reduce visual weight.
