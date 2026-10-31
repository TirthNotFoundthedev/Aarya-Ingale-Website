---
labels: [wayfinder:research]
status: closed
assignee:
blocked_by: []
---
# AI art pipeline for a layered paper-cutout portrait

## Question

Which currently available AI image tools and workflow can turn reference photos into a stylised but recognisable ¾-profile paper-cutout portrait, split into separate layers (hair, face, dupatta, accessories), and produce seamless Bandhani/saree border tiles and motif cutouts, within ~1 day and on a free or cheap plan? What export formats (transparent PNG/WebP vs SVG via vectorising) work best for GSAP parallax?

## Resolution

Findings: [research/ai-art-pipeline.md](../research/ai-art-pipeline.md). Make one master portrait with Gemini (Nano Banana 2), seeded with 3–5 ¾-angle photos and checked for likeness by friends. Cut it into layers (Qwen-Image-Layered demo, then Photopea) and have Gemini paint in what's hidden behind hair and dupatta. Build the Ring procedurally as SVG, not with AI. Ship portrait layers as AVIF with WebP fallback on one shared canvas (~1200px phone, ~1600px desktop, 4–6 layers), with paper shadows baked in. Risks: likeness, AI "beautifying" or lightening her face (say "do not beautify"), no transparent output so every layer needs background removal, free quotas, privacy (turn Gemini activity off; keep her photos off Recraft's free plan).
