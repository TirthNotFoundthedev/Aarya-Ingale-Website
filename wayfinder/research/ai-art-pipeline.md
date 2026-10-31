---
ticket: wayfinder/tickets/03-ai-art-pipeline.md
researched: 2026-10-30
---
# AI art pipeline for the layered paper-cutout Portrait and Ring

All sources were fetched on **2026-10-30**. AI tool limits and prices change often, so check them again on the day you use them. Text marked *(judgement)* is my own reasoning and has no source behind it.

## TL;DR: recommended 1-day pipeline

1. **Make one master Portrait image** in the **Gemini app (Nano Banana 2, free)**. Upload 3–5 photos of Aarya taken near ¾ profile and ask for a flat paper-cutout style on a plain solid background. Keep refining in the same chat and stop at the first version friends recognise. Fallback or second opinion: ChatGPT (free image creation is "Limited").
2. **Split the master into layers. Don't generate each layer separately.** Two routes:
   - Try the free **Qwen-Image-Layered** Hugging Face Space first. It splits one image into N RGBA layers.
   - For the parts it gets wrong, cut by hand in **Photopea** (free, in the browser): Select → Remove BG, Select → Subject, Magic Cut, Quick Selection.
   - Then ask Gemini to edit the master ("same image, remove the dupatta / hair, show what's underneath") so every cut layer has painted content behind it.
3. **Make the Ring procedurally in SVG**, not as an AI image. Bandhani is mostly dots, so JS can generate it. Get the peacock and lotus motifs from **Recraft** (native SVG output) or from Gemini followed by the **VTracer** vectoriser. Arrange them with `<use transform="rotate()">`.
4. **Export the Portrait layers as AVIF, with a WebP fallback**, at about 1200 px (phone) and 1600 px (desktop) wide. Export the Ring and motifs as SVG, loaded through `<img>`. Animate only `transform`/`opacity` with GSAP, and use `gsap.matchMedia()` for reduced motion.

## 1. Reference photos to a recognisable ¾-profile paper-cutout Portrait

| Tool | What the primary source says | Cost | Fit |
|---|---|---|---|
| **Gemini app, Nano Banana 2** | Image generation with Nano Banana 2 is ticked for "no plan" (free). "Redo images with Nano Banana Pro" is limited to AI Plus/Pro/Ultra. Paid tiers get 2×/4×/more usage. No numbers are published. ([Gemini limits](https://support.google.com/gemini/answer/16275805)) | Free | **Primary.** Best free multi-reference tool. |
| Gemini API (same models) | Up to **14 reference images** in total. The per-model table allows 4–5 *character* images on the Flash models. Every output carries a SynthID watermark. Resolutions are 1K/2K/4K. **Alpha output is not mentioned** ([docs](https://ai.google.dev/gemini-api/docs/image-generation)). No free tier for image output. Nano Banana 2.1 costs about $0.034 per 1K image and $0.05 per 2K image ([pricing](https://ai.google.dev/gemini-api/docs/pricing)). | ~$0.03–0.13/img | Only worth it if the app quota runs out. |
| **ChatGPT / OpenAI GPT Image** | The Free plan lists image generation as "Limited" ([pricing](https://chatgpt.com/pricing/), [Free FAQ](https://help.openai.com/en/articles/9275245-chatgpt-free-tier-faq)). The API models `gpt-image-2.5-sunburst` / `-flare` accept several reference images and support `background: "transparent"` with PNG/WebP output. The docs warn the models "may occasionally struggle to maintain visual consistency for recurring characters" ([OpenAI image guide](https://developers.openai.com/api/docs/guides/image-generation)). | Free (limited) / API paid | Second opinion. **Native transparency** is useful for motif cutouts. |
| Recraft | Native vector/SVG generation. **On the Free plan, images are public and owned by Recraft** ([pricing](https://www.recraft.ai/pricing), [free plan](https://www.recraft.ai/docs/plans-and-billing/free-plan)). | Free / paid | **Don't upload Aarya's face here on the free plan.** Fine for motifs. |

**Concrete steps (Gemini app):**

1. **Turn off Keep Activity first.** If it is on, a subset of chats is reviewed by humans and used for training ([Gemini privacy hub](https://support.google.com/gemini/answer/13594961), updated 2026-10-26). These are a friend's photos, so this matters.
2. Pick 3–5 well-lit photos. At least two should be close to the target ¾ angle (one eye visible). Use one front photo for features. No sunglasses, no heavy filters.
3. Start with a prompt along these lines: "Using these photos of the same woman as the identity reference, make a ¾ side-profile portrait facing left, only one eye visible, head and shoulders, wearing a pink Bandhani dupatta. Style: Indian layered paper-cutout. Flat colour areas, crisp cut edges, subtle paper texture and soft drop shadows between layers. Keep her exact nose shape, eyebrows, lip shape, jawline, hairline and skin tone. Plain flat #F2E6D8 background, no props, no text."
4. Fix one thing per turn, in the same chat ("make the nose slightly longer, keep everything else identical"). Google advises stating each uploaded image's role clearly ([prompt tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)).
5. Once one image passes the "would her friends recognise her?" test, **freeze it as the master**. Do every later edit from the master, not from new text prompts.

## 2. Splitting the master into parallax layers (hair, face, dupatta, accessories)

**Option A: native layered output with Qwen-Image-Layered.** It "decompos[es] an image into multiple RGBA layers". You choose the layer count (`layers=4`, or 3–8). Layers can be split again recursively. Licence is Apache 2.0, the model is about 20B parameters, and 640 px resolution is recommended ([model card](https://huggingface.co/Qwen/Qwen-Image-Layered), paper arXiv 2512.15603, Dec 2025).

- Free demo: [HF Space](https://huggingface.co/spaces/Qwen/Qwen-Image-Layered). It runs on ZeroGPU, so expect a daily quota.
- **Caveats** *(judgement)*:
  - 640 px output is too small to ship. Use its layers as **masks** on the full-res master rather than as the final pixels.
  - It splits by visual element, which may not match hair, face, dupatta and accessories exactly.

**Option B: manual cutting in Photopea (reliable, free).**

1. Open the master (File → Open), then run Select → Remove BG ([tutorial](https://www.photopea.com/tuts/single-click-background-removal/)). This gives the whole-figure layer.
2. Cut each part onto its own layer with **Select → Subject**, **Select → Magic Cut** (paint green for keep, red for drop) ([Magic Cut](https://www.photopea.com/tuts/magic-cut-remove-image-background-online/)), or Quick Selection / Magic Wand ([selecting](https://www.photopea.com/learn/advanced-selecting)). Flat paper-cutout colours make Magic Wand work unusually well.
3. Export each layer with File → Export As → PNG at full size, keeping the same canvas size for every layer. Then all layers stack at `0,0` in CSS.
4. Heavy AI use in Photopea needs Premium ([AI in Photopea](https://www.photopea.com/tuts/get-unlimited-ai-inside-photopea/)). The manual tools are free.

**Option C: cleaner masks with BiRefNet.** Use it for the outer silhouette (hair strands). MIT licence, with a free [demo Space](https://huggingface.co/spaces/ZhengPeng7/BiRefNet_demo) ([model](https://huggingface.co/ZhengPeng7/BiRefNet)). Meta's SAM 3 can segment by text prompt ("hair", "earring") in the Segment Anything Playground ([SAM 3](https://ai.meta.com/sam3/)). I did not confirm whether the Playground lets you download masks.

**Filling the hidden areas (needed for any option)** *(judgement)*: once the layers move apart, the gaps under the hair and dupatta show. To avoid this:

- Ask Gemini to edit the master: "same image, same style, remove the dupatta and show the neck and blouse underneath". Repeat for the hair. Use those versions as the lower layers.
- Keep parallax offsets small: about 4–12 px on phones and 20–30 px on desktop.

**Don't** generate each layer from its own prompt. Style and proportions drift between generations, and OpenAI's docs note the same consistency weakness.

## 3. Bandhani / Paithani patterns and motif cutouts

**The Ring should be procedural** (see section 5). Use AI only for the **motifs**:

- **Recraft:** native SVG generation. The free plan allows up to 3 uploads a day and 2 images per prompt, and outputs are public ([free plan](https://www.recraft.ai/docs/plans-and-billing/free-plan)). Through the API it costs $0.08 per vector image and $0.01 to vectorise or remove a background ([API pricing](https://www.recraft.ai/docs/api-reference/pricing)). Example prompt: "single peacock motif, Paithani style, flat 3-colour paper cutout, magenta, emerald, gold, centred, isolated".
- **Gemini or ChatGPT, then vectorise:** generate the motif on a flat background, then convert it with **VTracer**. It is MIT-licensed and turns PNG into SVG, with a free [web app](https://vtracer.visioncortex.org/) and the `--filter-speckle`, `--color-precision` and `--mode spline` options ([repo](https://github.com/visioncortex/vtracer)). Flat 3–5 colour art traces cleanly.
- ChatGPT/OpenAI can output a **transparent PNG/WebP directly** (`background: "transparent"`), which skips the background-removal step for raster motifs.

For a seamless *linear* saree border tile, ask for "seamless horizontally tileable border strip" and then check the seam by placing two copies side by side. AI tiles often have a visible seam *(judgement)*. A border built from SVG `<pattern>` or a repeated `<use>` is seamless by construction.

## 4. Export formats and sizes for GSAP parallax on phones

| Asset | Format | Why |
|---|---|---|
| Portrait layers (painterly, textured) | **AVIF**, WebP fallback via `<picture>` | AVIF has 96.35% global support (iOS Safari 16+), WebP 97.18% ([caniuse AVIF](https://caniuse.com/avif), [caniuse WebP](https://caniuse.com/webp), StatCounter data from Sept 2026). AVIF gives ">50% savings vs JPEG" ([web.dev](https://web.dev/articles/compress-images-avif)). Both support alpha. |
| Ring, Bandhani dots, Paithani motifs, interest motifs | **SVG** (flat colours) | Small file size, sharp at any DPR, can be recoloured with CSS. |
| Paper texture overlay | One small tiled WebP/AVIF | Reused across all layers. |

**Sizes** *(judgement, based on DPR 2–3 phones)*:

- Portrait canvas about 1200 px wide for phones and 1600 px for desktop, served with `srcset`. All layers share one canvas size. Crop transparent margins only if you also record their offsets.
- Decoded memory is width × height × 4 bytes, so one 1600×2000 layer is about 12.8 MB. Keep it to 4–6 Portrait layers.
- Budget about 60–150 KB per AVIF layer.

**GSAP/phone rules:**

- Animate only `transform`/`opacity`.
- Don't animate CSS `filter: drop-shadow`. Bake paper shadows into the PNG instead *(judgement)*.
- Pin a wrapper and animate its children. GSAP warns against animating the pinned element itself, and against `will-change: transform` on ancestors of pinned elements ([ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)).
- Use `gsap.matchMedia()` to set up phone/desktop and `prefers-reduced-motion` variants. It reverts automatically when a query stops matching ([matchMedia docs](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)).
- `ScrollTrigger.normalizeScroll()` can stop the mobile address bar jumping ([ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)).

## 5. Can the Ring be procedural (SVG/CSS)? Yes, and that's the recommended route

- **Bandhani:** tie-dye dots, usually small light dots in clusters of four arranged in rows and rings. A ~30-line JS script can generate this as SVG: for each ring radius `r`, place `n = round(2πr / spacing)` dot clusters at `angle = i·360/n`. Add 1–2 px random jitter and slight size variation so it looks hand-tied rather than mechanical *(judgement)*.
- **Paithani motif band:** define the peacock or lotus once as a `<symbol>`. Place copies with `<use href="#peacock" transform="rotate(${i*360/n}) translate(0,-R)">`.
- **Stripes and wedges:** CSS `repeating-conic-gradient(from 0deg at 50% 50%, c1 0 15deg, c2 15deg 30deg)` makes radial wedge borders ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-conic-gradient)).
- **Performance** *(judgement)*: build the SVG at build time (or once at load), save it as `ring.svg`, and load it as `<img>`. The browser then rasterises it once, and GSAP only rotates the image (`rotation` is a compositor transform). Rotating a live inline SVG with thousands of `<circle>` nodes can drop frames on low-end phones.
- **Benefits:** perfect radial symmetry with no seams, a palette you control in code (pink-led), a tiny file, and no AI-consistency risk.

## Likeness and consistency pitfalls

| Pitfall | Work-around |
|---|---|
| Stylisation weakens likeness, and ¾ profile is harder than a front view | Use reference photos already near ¾. Name her distinctive features in the prompt. Have 2–3 mutual friends do a blind recognition check before you split layers. |
| Models "beautify" faces, lighten skin or slim features | Write "keep her exact skin tone and face shape; do not beautify" in every edit. |
| Reference images get ignored in some generations, and character consistency "may vary" ([Gemini docs](https://ai.google.dev/gemini-api/docs/image-generation); [OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)) | Re-roll. Stay in one chat. Re-attach the master each turn. |
| Layers generated separately don't line up | Generate one master, then cut it. Make under-layers by *editing* the master, never by fresh prompts. |
| Gaps appear when layers move apart | Paint under-layers (section 2) and keep offsets small. |
| Gemini has no alpha output (not mentioned in its docs) | Use a flat, contrasting solid background, then Photopea Remove BG / BiRefNet. |
| Free quotas (Gemini app numbers unpublished, ChatGPT "Limited", HF ZeroGPU daily quota) | Start the portrait early on day 1 and spread the work across Gemini and ChatGPT. A Gemini AI Plus/Pro trial or about $1–2 of API credit is the cheap escape hatch. |
| Privacy and ownership | Turn off Gemini Keep Activity. Don't put her face into Recraft's free plan (outputs are public and owned by Recraft). Remember all Gemini images carry SynthID. |

## Open / unverified

- Exact free daily image counts for the Gemini app and ChatGPT. Neither official page publishes them.
- Whether the Segment Anything Playground exports masks.
- Whether the Qwen-Image-Layered Space accepts inputs above 640 px or applies a per-day ZeroGPU limit to anonymous users. Reports of a "ZeroGPU daily quota" come from third parties.
- The Gemini API docs table gives 4 vs 5 character-reference images depending on the model and version. Check the table before relying on it.
