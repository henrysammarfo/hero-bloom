

## Rebrand Landing Page: RemitAgent APEX → **Cleora**

### What changes

1. **Hero headline**: "Grow" → "Cleora"
2. **Hero subtext**: Update to remittance-focused copy: "Autonomous AI agents that settle cross-border payments in under 5 minutes — for 0.5%"
3. **CTA button**: "Schedule a Consult" → "Start Sending" (or similar hackathon-appropriate CTA)
4. **Navbar brand**: Update SVG logo text from "Grow" to "Cleora", update the diamond icon shape
5. **Navbar items**: "Features", "Solutions", "Plans", "Learning" → "How It Works", "Corridors", "Agents", "Docs" (relevant to the product)
6. **Page title**: Update `index.html` title and meta tags to "Cleora — Autonomous Cross-Border Settlement"
7. **Gradient colors**: Keep the existing blue-white gradient on the headline — it fits the fintech/settlement tone well
8. **Marquee brands**: Replace placeholder brands with corridor/partner names or keep as social proof placeholders
9. **Marquee label**: "Relied on by brands across the globe" → "Trusted across corridors worldwide"

### Files to edit

- `src/components/HeroSection.tsx` — headline, subtext, CTA
- `src/components/Navbar.tsx` — nav items, logo reference
- `src/assets/logo.svg` — brand name in SVG
- `index.html` — title + meta tags
- `src/components/VideoSection.tsx` — marquee text

### What stays the same

- All styling, theme tokens, liquid-glass effects, video fade logic, marquee animation — unchanged
- Component structure, button variants, Tailwind config — unchanged

