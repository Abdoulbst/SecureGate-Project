---
trigger: always_on
---

# Rule: Design System

## Token Files Are the Source of Truth

The project utilizes a structured design token system based on the MD3 (Material Design 3) specification. The agent must never modify these definitions:

- `tokens/design-tokens.js` (or translated `tokens/design-tokens.css`) — Defines the global font family (**Inter**), explicit typography scale (Display, Headline, Title, Body, Label), tracking, and line heights.

The token system exports CSS custom properties (CSS variables) that are available globally.

## Mandatory: Use CSS Variables, Never Raw Values

The agent must never write hardcoded color values or typography values anywhere in this codebase.

**Wrong:**
```css
color: #1a1a1a;
font-size: 16px;
font-family: 'Inter', sans-serif;
background: #f5f5f5;
letter-spacing: -3.5px;

Correct:
color: var(--color-text-primary);
font-size: var(--typography-display-large-font-size);
font-family: var(--font-family-base);
letter-spacing: var(--typography-display-large-letter-spacing);

Before writing any style value, check the token files. If a variable or standard mapped Tailwind utility exists for what you need, use it. If it does not exist, ask before inventing a new value.

design-system.md — UI/UX & Tailwind Hardening Blueprint
This rule file governs the visual presentation layer, interface layouts, and form states for SecureGate. It serves as the primary constraint layer for the Designer Agent inside the directory, ensuring a premium, flat aesthetic, full accessibility compliance, and secure user-experience feedback mechanics.

1. Aesthetic Direction (Flat Premium)
SecureGate utilizes a high-contrast, flat design system inspired by minimalist typography and functional interfaces. It avoids unnecessary visual weight like heavy drop shadows, complex gradients, or decorative graphics.

Visual Styling Variables
Palette: Deep rich darks, pure crisp white surfaces, clean mid-tone structural borders, and highly intentional status indicators.

Typography Scale & Mapping: Rely strictly on the Inter token scale definitions. Custom or unmapped font-sizes are completely prohibited.

Display / Headline (Large/Med/Small): Used exclusively for hero numbers, structural lockups, and critical dashboard totals. Must preserve the tight, premium negative tracking defined in the tokens (e.g., Display Large tracking at -3.5px).

Title (Large/Med/Small): Used for modal headers, card titles, and primary view groupings.

Body (Large/Med/Small): Regular weights (400) used for all paragraph blocks, descriptions, and user readouts.

Label (Large/Med/Small): Medium weights (500) applied explicitly to Form Inputs, Button text, Table headers, and Micro-data readouts.

Borders: Fixed hairline structural borders (border border-neutral-200 or border-neutral-800) used to define cards and form boundaries instead of elevation layers.

2. Component Design & Form Layout Rules
All interface layouts—including sign-up, login, token verification alerts, and credential recovery fields—must be laid out as explicit, centered container frames.

Global Form Layout Pattern
┌────────────────────────────────────────────────────────┐
│ [Label] Text Element                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Input Field Box Element                            │ │
│ └────────────────────────────────────────────────────┘ │
│ [Helper Text or Inline Error Alert]                    │
└────────────────────────────────────────────────────────┘

Layout Constraints
Accessible Labels: Every single input element must feature an explicitly written, accessible <label> tag mapped using the htmlFor attribute property. Typography must use the Label token subscale.

Explicit Tap Targets: Buttons and input interactive surfaces must maintain a minimum physical height of 44px (h-11) to prevent interaction errors on small mobile screens.

Width Restrictions: Form components must live inside fixed-width modules restricted to max-w-md (28rem) to preserve visual alignment across desktop and viewport scales.

3. UI State Feedback Specifications
To protect the application layer against unexpected network latencies and malicious inputs, forms must support three distinct states.

3.1 The Loading State
When a submit action triggers, the component must immediately freeze inputs and display a clear loading indicator.

Action Rules: Apply disabled attributes to all underlying <input> text fields and the primary <button>. Change button opacity to visually reflect the blocked interaction state.

Visual Indicator: Replace button text or append an inline, infinitely looping CSS-driven vector loading spinner.

3.2 The Defensive Validation State
Form responses must use direct, human-readable strings placed exactly under the invalid input target.

Success Feedback: Clear, predictable system labels.

Error Messaging: Display clear validation warnings (e.g., "Password requires at least one uppercase letter" instead of generic "Something went wrong" loops).

4. Password Strength Component Spec
The sign-up module must include a live, client-side visual evaluation component that dynamically checks input string properties without communicating data back to the server.

import React from "react";

interface PasswordStrengthProps {
  score: 0 | 1 | 2 | 3; // 0: Weak, 1: Fair, 2: Good, 3: Strong
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ score }) => {
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const barColors = [
    "bg-red-500",    // Weak
    "bg-orange-500", // Fair
    "bg-yellow-500", // Good
    "bg-green-600"   // Strong
  ];

  return (
    <div className="w-full space-y-2 mt-2">
      <div className="flex justify-between items-center text-xs font-medium text-neutral-500">
        <span>Password Strength</span>
        <span>{labels[score]}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-sm overflow-hidden">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-full transition-colors duration-300 ${
              index <= score ? barColors[score] : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

5. UI Enforcement Guardrails
Zero Utility Contamination: The Designer Agent must use standard Tailwind CSS classes mapping cleanly to token configurations. Custom raw CSS declarations inside component wrappers are banned.

System Color Uniformity: Text indicators must use explicit semantic pairings: text-red-600 for system warnings, text-green-600 for verification feedback, and text-neutral-900/text-white for primary context layers.

6. Mobile-First
Secure Gate users are primarily on mobile. Every component must be built mobile-first:

Default styles target mobile (small screens).

Use @media (min-width: 768px) via Tailwind's md: prefix to layer in desktop styles.

Touch targets must be a minimum of 44px tall.

The product views must be fully functional and pixel-perfect down to a 375px viewport scale.
