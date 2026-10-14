---
name: Vicente Aznar, Portfolio
description: A single-page portfolio drawn as a working copper circuit board.
colors:
  board-black: "#0d0c0a"
  board-layer: "#14120f"
  board-surface: "#1b1814"
  hairline: "rgba(237, 232, 222, 0.09)"
  hairline-strong: "rgba(237, 232, 222, 0.17)"
  silkscreen-ink: "#ede8de"
  silkscreen-dim: "#b5ad9f"
  silkscreen-muted: "#928a7d"
  copper: "#c97d4f"
  copper-bright: "#e29a6c"
  copper-wash: "rgba(226, 154, 108, 0.16)"
typography:
  display:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(3rem, 10vw, 8rem)"
    fontWeight: 600
    lineHeight: 0.88
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 4.2vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  silkscreen:
    fontFamily: "Chivo Mono Variable, ui-monospace, monospace"
    fontSize: "0.75rem"
    lineHeight: 1.4
    letterSpacing: "0.01em"
    fontFeature: "'tnum'"
rounded:
  pad: "2px"
  via: "9999px"
spacing:
  gutter-sm: "20px"
  gutter: "24px"
  section-sm: "80px"
  section: "96px"
  section-lg: "128px"
  container: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.board-black}"
    rounded: "{rounded.pad}"
    typography: "{typography.label}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.copper-bright}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.silkscreen-ink}"
    rounded: "{rounded.pad}"
    padding: "0 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.copper-wash}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.silkscreen-dim}"
    rounded: "{rounded.pad}"
    padding: "0 20px"
    height: "44px"
  tech-tag:
    backgroundColor: "transparent"
    textColor: "{colors.silkscreen-dim}"
    rounded: "{rounded.pad}"
    padding: "0 10px"
    height: "28px"
  project-card:
    backgroundColor: "{colors.board-layer}"
    textColor: "{colors.silkscreen-ink}"
    rounded: "{rounded.pad}"
    padding: "24px"
  contact-pad:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.board-black}"
    rounded: "{rounded.pad}"
    padding: "12px 24px"
    height: "64px"
---

# Design System: Vicente Aznar, Portfolio

## Overview

**Creative North Star: "Placa de cobre"**

The page is a working circuit board. The ground is matte solder-mask black with a faint static noise, layered in two slightly warmer tones. Copper is the only colour that acts: traces, filled pads for primary actions, the active state. Every small label is silkscreen, set in mono, and it always carries real data (a count, a date, a live time, a last push), never a category name.

On wide screens (xl and up) one copper trace leaves the hero board on a square pad, runs down the left margin through every section, lights a ring via level with each heading, fills with scroll, and terminates by bending onto the contact email pad. Images sit inside fiducial corner marks like a board waiting for the pick-and-place machine. Type is Archivo: expanded to its widest axis for display, like equipment lettering, and normal width for reading.

The system is flat and precise: hairline rules instead of boxes, 2px corners, no glass, no glow halos, no decorative shadows. It explicitly refuses the dark-violet developer template (Geist, glowing edges, rounded cards, eyebrow labels). The Ubuntu OS simulator (`src/components/ubuntu/**`, `UbuntuOS.jsx`, `Terminal.jsx`) is a separate, authentic Ubuntu world and is out of scope for this document.

**Key Characteristics:**
- Matte board black with two warmer layers; copper as the single active colour.
- Archivo expanded (wdth 125) semibold for display; Chivo Mono only for data.
- 2px pads everywhere; full circles reserved for vias and status dots.
- Hairline section boundaries and a margin trace that ties the page together.
- Fiducial corner marks on images and covers.
- Flat at rest; motion is short and decelerating.

## Colors

A warm, near-black board with bone-coloured silkscreen ink and one copper metal.

### Primary
- **Copper** (copper): traces, the primary filled pad (one per screen), fiducials, the margin trace and its vias, the language-toggle pill, the active nav underline, selection highlight.
- **Bright Copper** (copper-bright): hover on copper pads, focus outline, live/in-development status dots, the signal moving through the request-flow diagram.
- **Copper Wash** (copper-wash): a 16% copper tint used as the hover fill of secondary buttons and the active filter tab. It is a flat fill, never a blurred halo.

### Neutral
- **Board Black** (board-black): page ground and text on copper pads.
- **Board Layer** (board-layer): cards, modal, menus, command palette.
- **Board Surface** (board-surface): image wells and covers inside cards.
- **Silkscreen Ink** (silkscreen-ink): headings, primary text, the active nav label.
- **Silkscreen Dim** (silkscreen-dim): body copy, subtitles, tags.
- **Silkscreen Muted** (silkscreen-muted): silkscreen annotations, metadata, idle nav. All three inks pass AA on every board layer.
- **Hairline / Hairline Strong** (hairline, hairline-strong): section rules, card and tag borders; the stronger one for secondary-button borders, overlays, and idle tracks.

### Named Rules
**The One Metal Rule.** Copper is the only chromatic colour in the interface. Brand colours appear only on a tech icon while it is hovered.

**The One Filled Pad Rule.** A screen carries at most one copper-filled action (the hero "Ver proyectos", the contact email pad). Everything else is an outline or a ghost.

## Typography

**Display Font:** Archivo Variable at width 125% (with system-ui)
**Body Font:** Archivo Variable at normal width (with system-ui)
**Label/Mono Font:** Chivo Mono Variable (with ui-monospace)

**Character:** Both are from Omnibus-Type, Buenos Aires, and self-hosted. Expanded Archivo reads like lettering stamped on equipment; Chivo Mono is the silkscreen.

### Hierarchy
- **Display** (600, clamp(3rem, 10vw, 8rem), 0.88, -0.04em, expanded): the name in the hero, one word per line. The contact headline uses the same voice a step down (clamp(2.5rem, 7vw, 5.5rem), 0.95).
- **Headline** (600, clamp(1.9rem, 4.2vw, 3rem), 1.02, -0.03em, expanded): section titles, balanced wrapping.
- **Title** (600, 1.25rem, -0.025em, normal width): card and item titles; the lead project card scales to 1.875–2.25rem.
- **Body** (400, 1rem–17px, relaxed leading): copy in silkscreen-dim, about 36rem measure; the hero lead runs 1.125–1.25rem.
- **Label** (500, 13px): nav links, small buttons, filter tabs; standard buttons are 14px.
- **Silkscreen** (mono, 0.75rem, 1.4, 0.01em, tabular figures, silkscreen-muted): data annotations only.

### Named Rules
**The Silkscreen Carries Data Rule.** Mono is used for real data: counts, dates, local time, last push, key hints. If the text is a category name or a section label, it is not silkscreen and should not exist as a kicker.

**The Wide Voice Rule.** The 125% width is for display and headline only. Body, titles, and labels stay at normal width.

## Layout

A single centred column with a 72rem maximum width and 20px gutters (24px from sm). Sections stack with generous vertical rhythm (80px, 96px from sm, 128px from lg) and each one opens with a full-width hairline instead of a box. Section headers put the title and subtitle on the left and any silkscreen annotation right-aligned on the baseline from md, with 48–64px below the header.

The hero fills the viewport: on lg the name and pitch sit left and the portrait sits right in a two-column grid aligned to the bottom, followed by a three-column fact list under a hairline. On smaller screens it stacks. The margin trace sits 24px outside the container on the left and appears only at xl (1280px) and up; below that, the hairlines carry the structure alone.

The header is fixed at 64px, transparent at the top and 95% board black with a bottom hairline once scrolled. It hides on scroll down and returns on scroll up or on keyboard focus.

## Elevation & Depth

Flat by default. Depth comes from the three board layers (black, layer, surface) and hairline borders, not from shadows. The only shadows are deep, black, offset-down ambient drops on true overlays (project modal, command palette, CV menu) that separate them from the page underneath. A matte noise texture at 4% opacity sits over the whole page on fine-pointer devices.

### Shadow Vocabulary
- **Overlay drop** (`box-shadow: 0 40px 120px -20px rgba(0,0,0,0.8)`): modal dialogs and the command palette only.
- **Via ring** (`box-shadow: 0 0 0 5px var(--accent-glow)`): a hard-edged copper-wash ring around the active node of the request-flow diagram. It is a solid spread ring, not a blur.
- **Tab underline** (`box-shadow: inset 0 -2px 0 var(--accent)`): the 2px copper base of the active filter tab.

### Named Rules
**The No Glow Rule.** No blurred coloured shadows, no backdrop-filter glass, no glowing edges. Copper shows up as a solid line, fill, or ring.

## Shapes

Every rectangle is a pad with 2px corners: buttons, cards, tags, inputs, menus, the modal, the image wells, and the focus outline. Full circles are reserved for components that are round on a real board: ring vias (11px, 2px copper stroke on board black), status dots (6–8px), and flow nodes (15px). The trace origin is a square 10px copper pad. Fiducials are four 14px L-shaped corners in a 2px copper stroke, set 8px outside a portrait or 12px inside a card cover.

## Components

### Buttons
Copper pads, not pills.
- **Shape:** 2px corners; heights 44px (md) and 36px (sm).
- **Primary:** copper fill with board-black text, 20px horizontal padding, 14px medium. Hover moves to bright copper.
- **Secondary:** hairline-strong outline with ink text. Hover turns the border copper and adds the copper wash.
- **Ghost:** dim ink text with no border. Hover moves to ink with a 4% white fill.
- **Hover / Focus / Active:** 200ms colour transitions, a 0.97 press scale, and a 2px bright-copper focus outline offset 3px. Trailing icons nudge in their direction on hover.

### Chips (Tech tags)
- **Style:** a 2px outlined tag with a hairline border and dim ink. 28px tall at 12px, or 36px at 14px. Monochrome Simple Icons glyph inline.
- **State:** on hover the border strengthens, the text goes to ink, the tag lifts 1px, and the icon alone takes its brand colour.

### Cards / Containers
- **Corner Style:** 2px.
- **Background:** board layer, with a board-surface image well (16:10, or 52% width on the lead card).
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** hairline; on hover, copper at 50% with a 2px lift and a 1.03 image zoom over 700ms.
- **Internal Padding:** 24px; the lead card uses 32–40px.
- Fiducials frame the cover; the status dot and an up-right arrow sit at the top of the text block.

### Navigation
- 13px medium links in muted ink; hover and active move to ink. The active link carries a 2px copper underline that slides between items.
- Utility controls are 40px square pads with a hairline border: a language toggle with a sliding copper pill (board-black text when active), a sound toggle, and a menu button on mobile.
- Filter tabs reuse the pattern: the active tab has a copper-wash fill, a 2px copper underline, and a mono count.

### Margin Trace (signature)
A 1px trace with a 20% copper bed that fills solid copper as the section scrolls past, using a spring. A ring via sits level with each heading. It starts at the hero's square pad and ends at the contact section, bending 48px onto the email pad. It shows only at xl and up and stays static under reduced motion.

### Request-flow Diagram (signature)
The architecture is drawn as a signal path: a hairline-strong track (horizontal on md, vertical on mobile), a bright-copper fill and dot that travel to the active node, and 15px nodes that are idle (hairline ring), reached (bright-copper ring), or active (copper fill plus via ring). Hosts are drawn as dimension lines over the layers they run. Hovering or focusing a node pins it, and its detail swaps in below a hairline.

### Contact Pad (signature)
The page's terminal: the email address set in expanded Archivo on a 64px copper pad that scales fluidly. Social links follow as 15px dim-ink links with up-right arrows under a hairline.

## Do's and Don'ts

### Do:
- **Do** use 2px corners on every rectangular element, and keep circles for vias, status dots, and flow nodes.
- **Do** keep copper as the only active colour and show at most one copper-filled pad per screen.
- **Do** make every mono annotation carry live or factual data (a count, time, date, or last push).
- **Do** set display and section headings in Archivo at wdth 125 and weight 600 with tight negative tracking.
- **Do** separate sections with a full-width hairline, and frame images with fiducials.
- **Do** ease with `cubic-bezier(0.16, 1, 0.3, 1)` and collapse motion under prefers-reduced-motion.

### Don't:
- **Don't** use glows, blurred coloured shadows, or backdrop-filter glass. Ambient drop shadows belong on true overlays only.
- **Don't** add eyebrow or kicker labels above headings. A silkscreen line that names a category instead of carrying data is a kicker.
- **Don't** round cards, buttons, or tags beyond 2px, or turn them into pills.
- **Don't** introduce a second accent hue. Brand colours live only on hovered tech icons.
- **Don't** use Geist or a system display face for headings.
- **Don't** apply this system to the Ubuntu OS simulator, which keeps its own Ubuntu world.
