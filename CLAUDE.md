# Aarya's website (thecheriari.vercel.app)

A surprise personal site for Aarya Ingale, due **Nov 3, 2026**. Planning is finished; this repo is now in execution.

## Every session

1. Read [SPEC.md](SPEC.md). It is the source of truth for every design decision. Use the terms in [GLOSSARY.md](GLOSSARY.md).
2. Do **one** step from [execution/README.md](execution/README.md): the one the user names, or else the first unticked step whose dependencies are ticked.
3. Finish on the step's **Done when**, then tick it in `execution/README.md` and write the `## Outcome` section of the step file: what was built, file locations, anything a later step needs to know.

## When a design question comes up

- If SPEC.md answers it, follow SPEC.md.
- If it doesn't, ask the user, then add the answer to SPEC.md.
- [wayfinder/](wayfinder/map.md) holds the planning history (why each decision was made). Read it only when you need that reasoning.

## Conventions

- Every piece of visible text, link and photo comes from `src/content.js`.
- The `prototypes/` folder holds throwaway prototypes. Copy behaviour from them; leave them out of the build.
