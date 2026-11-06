# Cosmos Hub — Copilot Build Instructions

## 1. Project Identity

Build **Cosmos Hub**, an interactive space-exploration and planet-simulation web platform.

Core idea:

> **Explore → Discover → Experiment → Learn**

The experience must feel like exploring a digital universe rather than browsing a normal educational website.

The project requirements are based on the Cosmos Hub hackathon proposal. The proposal describes the platform as combining:
- interactive Solar System exploration
- astronomy facts
- space news / mission updates
- space quotes with favorites
- a personalized "My Cosmos" area
- a hypothetical planet simulator
- simplified scientific calculations
- optional AI explanations

The proposal's strongest differentiator is the transition from learning about a planet to changing its properties and asking what would happen.

---

## 2. Primary Development Goal

Create a polished, hackathon-ready, responsive website with a strong visual identity.

Prioritize **quality over feature count**.

The MVP must make these features work well:

1. Interactive Solar System
2. Planet information / quick facts
3. Quotes + favorites
4. Space news section
5. Planet Lab with live sliders
6. Python/FastAPI calculation backend
7. AI-style explanation layer for simulated planets

Do not build a large number of unfinished features.

---

## 3. Design Direction

### Visual Theme

Use a premium deep-space aesthetic:
- near-black / deep navy background
- subtle star field
- glowing planets
- glassmorphism cards
- soft gradients
- cyan / violet / blue accents
- restrained glow effects
- smooth transitions
- cinematic spacing
- clean modern typography

The site should look like a **real interactive space product**, not a generic dashboard.

Avoid:
- excessive neon
- overly bright backgrounds
- childish cartoon styling
- huge amounts of text
- generic Bootstrap-looking cards
- unnecessary borders everywhere
- excessive animations that hurt usability

### UX Principle

Every screen should answer:

> "What can I explore or experiment with here?"

Use visual hierarchy and interaction instead of long paragraphs.

---

## 4. Application Structure

Create these main routes:

### `/`
Home / Universe

Purpose:
- immersive hero
- interactive Solar System
- planet selection
- quick cosmic fact
- entry points to Discover and Planet Lab

### `/discover`
Discover

Include:
- planets
- moons
- astronomy facts
- educational cards
- searchable/filterable content where useful

### `/news`
Space News

Include:
- latest space-related stories
- date
- source
- short summary
- category filters
- "Read More" links

Categories may include:
- NASA
- SpaceX
- ISRO
- ESA
- Astronomy
- Exoplanets
- Missions

### `/quotes`
Quotes

Include:
- quote of the day
- quote cards
- person/author
- favorite button
- filter by person where useful
- share-style quote card

### `/my-cosmos`
My Cosmos

Include:
- favorite quotes
- custom user-written lines
- favorite space emojis
- saved planets
- cosmic mood board

For the MVP, localStorage can be used if authentication/database is not yet implemented.

### `/planet-lab`
Planet Lab

This is the signature feature.

Include:
- planet name
- large interactive planet preview
- scientific sliders
- live calculations
- live visual changes
- derived properties
- habitability indicator
- explanation
- save planet
- reset button

### `/about`
About / Credits

Include:
- project purpose
- technology stack
- data/API sources
- scientific disclaimer
- team/project information placeholders

---

## 5. Home / Universe Requirements

The homepage should open with an immersive space scene.

### Hero

Include:
- Cosmos Hub logo/name
- short tagline
- strong CTA such as "Explore the Universe"
- secondary CTA such as "Create a Planet"

### Solar System

Implement an interactive Solar System.

Users should be able to:
- select planets
- hover over planets
- click a planet
- see its name
- see a short description
- open a detailed information panel
- navigate between planets

On desktop, support mouse interaction.

On mobile, support touch/swipe-friendly interaction.

If full 3D is too heavy initially, create a polished 2D/2.5D implementation and structure the code so Three.js/React Three Fiber can be added cleanly.

---

## 6. Planet Information

When a planet is selected, show:

- Planet name
- Short description
- Atmosphere
- Gravity
- Temperature
- Number of moons
- Interesting facts
- Discovery/mission information where available

The information panel should animate smoothly.

Do not hide critical information behind unnecessarily complicated interactions.

---

## 7. Cosmic Fact

Create a "Cosmic Fact of the Moment" component.

Show one short fact at a time.

Example facts from the proposal:
- A Martian day is about 24 hours and 39 minutes.
- Venus rotates so slowly that one rotation takes longer than its orbit around the Sun.
- Jupiter is the largest planet in the Solar System.
- Saturn is famous for its extensive ring system.
- The Moon is tidally locked, so nearly the same side always faces Earth.

Make facts data-driven so more can be added without changing components.

---

## 8. Space News

Do not hard-code the architecture around static news.

Create a service/API layer so news can come from an external source later.

Requirements:
- loading state
- error state
- empty state
- category filter
- source
- date
- summary
- original article link

Never expose private API keys in frontend code.

Use environment variables.

If an API is unavailable during development, use clearly separated mock data as a fallback.

---

## 9. Quotes

Create a reusable quote system.

Each quote should contain:
- quote text
- author
- optional category
- favorite state

Interactions:
- favorite/unfavorite
- filter
- quote of the day
- share/copy action

Favorites should persist.

If backend authentication is not available, use localStorage for the MVP.

---

## 10. My Cosmos

This should feel personal.

Sections:
- Favorite Quotes
- My Lines
- Favorite Emojis
- Saved Planets
- Cosmic Mood

Allow users to:
- save/remove quotes
- write a personal line
- select emojis
- save generated planets
- delete saved planets

Keep the UI lightweight and visually attractive.

---

# 11. Planet Lab — Highest Priority Feature

This is the signature feature and should receive the most polish.

Users create a hypothetical planet by changing parameters.

Required parameters:

- Planet radius
- Planet mass
- Gravity
- Atmospheric pressure
- Oxygen percentage
- Carbon dioxide percentage
- Nitrogen percentage
- Average temperature
- Distance from star
- Rotation speed / length of day
- Water coverage
- Magnetic-field strength

Use sensible ranges and units.

Avoid allowing impossible input combinations without giving the user feedback.

---

## 12. Planet Calculations

Gravity should be calculated approximately using:

`g = G × M / R²`

Where:
- `G` = gravitational constant
- `M` = planet mass
- `R` = planet radius

Compare calculated surface gravity with Earth's gravity.

Show:
- gravity in m/s²
- gravity as % of Earth
- estimated surface weight effect

All calculations should be clearly presented as simplified educational estimates.

---

## 13. Atmosphere Interpretation

Use the atmospheric inputs to generate understandable explanations.

Discuss:
- pressure
- oxygen concentration
- nitrogen
- carbon dioxide
- breathing suitability
- greenhouse implications
- atmospheric characteristics

Do NOT claim that oxygen percentage alone determines habitability.

---

## 14. Temperature Interpretation

Use:
- stellar distance
- average temperature
- atmosphere-related inputs

to create a simplified educational explanation.

Do not present the simulation as a real climate model.

Clearly label results:

> "Simplified educational estimate — not a scientifically complete climate or habitability model."

---

## 15. Day Length

Changing rotation speed should update:
- estimated day length
- visual rotation
- explanation of rotational effects

---

## 16. Water Visualization

Water coverage should visibly affect the planet.

For example:
- low water → mostly land
- medium water → mixed land/ocean
- high water → mostly ocean

The planet preview should update immediately.

---

## 17. Visual Planet Generator

Every relevant slider should have a visible effect.

At minimum:
- water coverage changes surface appearance
- atmospheric settings change atmosphere/glow
- temperature influences visual environment
- magnetic field can influence an outer visual field
- rotation changes animation speed

The user should feel:

> "I changed the planet, and I can immediately see the consequence."

---

## 18. Habitability Indicator

Create a simplified score.

Important:
- label it clearly as a simplified educational score
- do not call it scientifically accurate
- do not imply that the score proves a planet is habitable

Example label:

**Simplified Habitability Estimate**

Use explanatory factors rather than pretending to model every planetary variable.

---

## 19. Planet Result

After changes, generate a result card containing:

- Planet name
- Gravity
- Atmospheric pressure
- Oxygen
- CO₂
- Nitrogen
- Temperature
- Water coverage
- Day length
- Distance from star
- Magnetic field
- Simplified habitability estimate
- short educational interpretation

Include:
- Save Planet
- Reset
- Edit

---

## 20. "What If?" Mode

Add preset experiments such as:

### What if gravity increased by 50%?
Explain how surface weight and movement could differ from Earth.

### What if oxygen decreased?
Explain why respiration could become difficult and why oxygen alone does not determine habitability.

### What if the planet moved closer to its star?
Explain how received stellar energy could change.

### What if rotation became much slower?
Explain day length and planetary rotation.

### What if atmospheric pressure increased?
Explain how the atmospheric environment could differ from Earth's.

These should update the simulator rather than simply displaying static text.

---

## 21. AI Explanation Layer

If AI integration is available, use it to convert simulation values into understandable educational explanations.

AI should explain:
- what changed
- why it matters
- possible consequences
- what the user should be careful about interpreting

AI output must respect the scientific disclaimer.

Do not present speculative simulation output as established scientific fact.

If no AI API key exists:
- create a deterministic local explanation engine
- keep the same frontend interface
- make AI integration replaceable later

---

## 22. Backend Requirements

Use FastAPI for backend endpoints.

Suggested endpoints:

`GET /api/health`

`POST /api/planet/calculate`

`POST /api/planet/explain`

`GET /api/quotes`

`GET /api/news`

`POST /api/planets`

`GET /api/planets`

`DELETE /api/planets/{id}`

The frontend must communicate with the backend through a dedicated API client/service layer.

Do not put calculation logic directly inside React components.

---

## 23. Code Architecture

Use a clean component-based structure.

Suggested frontend:

```text
src/
├── components/
│   ├── layout/
│   ├── solar-system/
│   ├── planets/
│   ├── quotes/
│   ├── news/
│   ├── planet-lab/
│   ├── ui/
│   └── common/
├── pages/
├── hooks/
├── services/
├── data/
├── utils/
├── context/
├── assets/
├── App.jsx
└── main.jsx
```

Suggested backend:

```text
backend/
├── app/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── calculations/
│   └── utils/
├── requirements.txt
└── .env.example
```

Keep components small and reusable.

Avoid giant files.

---

## 24. State Management

Use React state for local component state.

Use Context or a lightweight state solution for:
- favorites
- saved planets
- global user preferences

Do not introduce Redux unless complexity actually requires it.

---

## 25. Responsive Requirements

Must work on:
- desktop
- laptop
- tablet
- mobile

Do not simply shrink desktop UI.

Mobile requirements:
- touch-friendly controls
- horizontally scrollable planet cards where appropriate
- collapsible panels
- readable sliders
- no horizontal overflow
- accessible navigation

---

## 26. Accessibility

Include:
- semantic HTML
- keyboard navigation
- visible focus states
- accessible buttons
- aria labels where necessary
- sufficient contrast
- reduced-motion consideration

Do not rely only on color to communicate status.

---

## 27. Performance

Avoid unnecessary re-renders.

For 3D:
- keep geometry reasonable
- avoid loading huge textures
- dispose of unnecessary resources
- lazy-load heavy sections if appropriate

For news/data:
- cache where sensible
- use loading skeletons
- handle failed requests gracefully

---

## 28. Error Handling

Every async feature needs:
- loading state
- success state
- empty state
- error state

Never leave the screen blank because an API failed.

---

## 29. Security

Never commit:
- API keys
- tokens
- passwords
- database credentials

Use `.env`.

Provide:

`.env.example`

with placeholder variables.

---

## 30. Scientific Disclaimer

Use this disclaimer wherever simulator results are displayed:

> Cosmos Hub's planet simulation uses simplified educational estimates. Real planetary climate, atmosphere, and habitability depend on many interacting variables and cannot be determined from this simulator alone.

---

## 31. Development Order

Implement in this order:

### Phase 1
- project setup
- routing
- design system
- navigation
- global background/star field
- responsive layout

### Phase 2
- Home
- Solar System
- planet selection
- planet information

### Phase 3
- Discover
- Cosmic Facts
- Quotes
- Favorites

### Phase 4
- News
- API service layer
- loading/error states

### Phase 5
- Planet Lab UI
- sliders
- live planet preview
- calculations

### Phase 6
- FastAPI integration
- saved planets

### Phase 7
- AI explanation layer
- What If experiments

### Phase 8
- polish
- animations
- accessibility
- responsive testing
- performance cleanup

---

## 32. Copilot Working Rules

When implementing:

1. First inspect the existing repository before changing anything.
2. Do not overwrite working code unnecessarily.
3. Reuse components.
4. Keep frontend/backend responsibilities separate.
5. Never hard-code secrets.
6. Prefer real functionality over placeholder buttons.
7. If an external API is unavailable, provide a clean mock adapter.
8. Keep the simulator calculations deterministic and testable.
9. Do not invent scientific claims.
10. Use comments only where logic is non-obvious.
11. Keep naming consistent.
12. Do not create unnecessary dependencies.
13. Run/build/test after major changes when possible.
14. Fix errors instead of hiding them.
15. Keep the final project easy for a student team to understand and present.

---

## 33. Definition of Done

The project is considered ready when:

- all main routes work
- homepage feels immersive
- Solar System is interactive
- planet information opens correctly
- facts display correctly
- quotes can be favorited
- My Cosmos persists local MVP data
- news has loading/error/fallback handling
- Planet Lab sliders update the planet
- gravity calculation works
- derived values update correctly
- What If experiments work
- saved planets work
- backend endpoints work
- AI explanation can be swapped between real AI and fallback logic
- responsive layout works
- no API secrets are exposed
- no major console errors remain
- scientific disclaimer is visible
- UI looks polished enough for a hackathon demo