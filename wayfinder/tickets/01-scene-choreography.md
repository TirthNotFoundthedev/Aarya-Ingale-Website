---
labels: [wayfinder:prototype]
status: closed
assignee:
blocked_by: []
---
# Scene choreography: desktop and phone

## Question

For each scene (Hero, About, Interests & Skills, Contact, optional Gallery), what do the Portrait, the Ring and the background patterns do as you scroll, on desktop and on a phone where the Portrait stays pinned at the bottom? Does the Gallery earn a scene, and where does it go? Resolve it with a rough scroll prototype using placeholder shapes.

## Assets

- [Hero sketch v1 (user)](../assets/hero-sketch-v1.png)
- [Now sketch v1 (user)](../assets/now-sketch-v1.png)
- [Socials sketch v1 (user)](../assets/socials-sketch-v1.png)

## Resolution

Resolved from the user's sketches instead of a code prototype.

- **Scenes:** Hero → Now → Interests & Skills → Socials. The Gallery comes later, not in the Nov 3 version.
- **Hero:** text centred at top. The Portrait and a huge Ring sit at the bottom centre, cropped by the bottom edge.
- **Now:** the Portrait and Ring sit in the bottom-right corner, cropped by the edges, and she faces left. Overview text goes on the left. The arrow button in the sketch was only a placeholder and is dropped.
- **Interests & Skills:** a hybrid of Now and Socials. Overview text on the left, and the skills and interests as a list on the arc around the Ring that rotates with scroll, like Socials.
- **Socials:** links on an outer arc around the Ring, moving along it as you scroll. Labels always stay upright.
- **Hero → Now transition:** the Ring moves to the corner. The Portrait drops out of the bottom of the screen and pops back up from the right, already in the new left-facing pose. That makes the corner Portrait a second pose, which matters for the asset list. A smooth slide was the first wish, but the drop-and-pop hides the pose change.
- **Phone:** the Portrait and Ring together take 50–70% of the screen height in the Hero and about 30% in the other scenes. The Portrait stays at the bottom and content sits above.
