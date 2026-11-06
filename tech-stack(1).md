# Cosmos Hub — Frontend-Only Tech Stack

## Current Phase

**Backend is NOT being implemented right now.**

Build Cosmos Hub as a polished frontend-only MVP.

Do NOT create:
- FastAPI
- Python backend
- PostgreSQL/Supabase
- backend API routes
- server-side AI integration
- authentication backend

The architecture should remain clean enough that a backend can be added later without rewriting the frontend.

---

## 1. Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React | Interactive UI |
| Build Tool | Vite | Development/build |
| Routing | React Router | Application routes |
| Styling | Tailwind CSS | Responsive styling |
| Icons | Lucide React | UI icons |
| Animation | Framer Motion | UI/page animations |
| 3D | Three.js + React Three Fiber | Solar System + planet visualization |
| 3D Helpers | Drei | R3F helpers |
| State | React Context + useState/useReducer | Global/local state |
| Persistence | localStorage | Favorites, custom lines, saved planets |
| Calculations | JavaScript utility modules | Planet calculations |
| Data | Local JSON/JS data | Planets, facts, quotes, fallback news |
| External APIs | Optional later | Do not depend on them for current MVP |

---

## 2. Frontend Architecture

```text
src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── navigation/
│   ├── solar-system/
│   ├── planet/
│   ├── facts/
│   ├── quotes/
│   ├── news/
│   ├── my-cosmos/
│   ├── planet-lab/
│   └── ui/
├── pages/
│   ├── Home.jsx
│   ├── Discover.jsx
│   ├── News.jsx
│   ├── Quotes.jsx
│   ├── MyCosmos.jsx
│   ├── PlanetLab.jsx
│   └── About.jsx
├── data/
│   ├── planets.js
│   ├── facts.js
│   ├── quotes.js
│   └── news.js
├── hooks/
├── context/
│   ├── CosmosContext.jsx
│   └── ThemeContext.jsx
├── services/
│   └── storageService.js
├── utils/
│   ├── planetCalculations.js
│   ├── habitability.js
│   └── formatters.js
├── App.jsx
└── main.jsx
```

Keep calculations and storage logic outside UI components.

---

## 3. Routes

```text
/
/discover
/news
/quotes
/my-cosmos
/planet-lab
/about
```

---

## 4. Styling

Use Tailwind CSS.

Visual direction:
- deep-space / near-black background
- dark navy surfaces
- subtle star field
- glassmorphism
- violet/cyan/blue accents
- soft glow
- premium typography
- cinematic spacing
- smooth transitions

Suggested starting palette:

```text
#050816
#080B18
#0B1020
#8B5CF6
#22D3EE
#60A5FA
#F8FAFC
#94A3B8
```

Do not make the UI overly neon or childish.

---

## 5. 3D

Use:

```text
three
@react-three/fiber
@react-three/drei
```

Use 3D for:
- Solar System
- interactive planet
- Planet Lab preview
- rotation
- atmosphere/glow
- orbital visualization where useful

Do not make every section 3D.

If WebGL is unavailable or too heavy, provide a graceful visual fallback.

---

## 6. Animation

Use Framer Motion for:
- page transitions
- cards
- panels
- modals
- hover states
- result transitions
- navigation

Use R3F/Three.js animation for actual planet rotation and 3D motion.

Avoid excessive animation.

---

## 7. Planet Data

Keep planet information in `src/data/planets.js`.

Each planet should have structured information such as:

```text
name
description
gravity
temperature
atmosphere
moons
facts
color/visual properties
```

Do not duplicate planet data inside components.

---

## 8. Cosmic Facts

Keep facts in:

```text
src/data/facts.js
```

Show one "Cosmic Fact of the Moment" at a time.

The proposal examples include facts about Mars, Venus, Jupiter, Saturn and the Moon.

---

## 9. Quotes

Keep quote data in:

```text
src/data/quotes.js
```

Features:
- quote of the day
- quote cards
- author
- favorite/unfavorite
- filtering
- copy/share action

Use localStorage for favorites.

---

## 10. News

For the current frontend-only phase, use:

```text
src/data/news.js
```

with realistic structured mock/fallback data.

The UI should still be designed as if the data came from an API.

Each item should have:
- title
- source
- date
- category
- summary
- article URL

Categories:
- NASA
- SpaceX
- ISRO
- ESA
- Astronomy
- Exoplanets
- Missions

When backend/API work starts later, replace the data service without rewriting the UI.

---

## 11. My Cosmos

Persist with localStorage.

Suggested keys:

```text
cosmos_favorite_quotes
cosmos_saved_planets
cosmos_custom_lines
cosmos_favorite_emojis
```

Create a reusable `storageService.js`.

Do not call localStorage directly from every component.

---

## 12. Planet Lab

This is the signature feature.

Required controls:

- Planet radius
- Planet mass
- Atmospheric pressure
- Oxygen %
- Carbon dioxide %
- Nitrogen %
- Average temperature
- Distance from star
- Rotation speed / day length
- Water coverage
- Magnetic-field strength

Gravity can be a **derived value**, rather than a separate manually controlled input.

---

## 13. Planet Calculations

For the current frontend-only MVP, calculations happen in:

```text
src/utils/planetCalculations.js
```

Use:

```text
g = G × M / R²
```

Return:
- gravity m/s²
- gravity % of Earth
- estimated day length
- atmospheric interpretation
- temperature interpretation
- simplified habitability estimate

Keep the calculations as pure JavaScript functions so they can later be moved to FastAPI with minimal changes.

---

## 14. Habitability

Create:

```text
src/utils/habitability.js
```

Use a clearly simplified educational scoring model.

Display:

> Simplified Educational Estimate

Never claim that the score proves a planet is habitable.

---

## 15. Planet Visualization

Every important slider should visibly affect the planet.

Examples:
- water → visible ocean coverage
- temperature → visual environment/atmosphere
- atmospheric settings → atmosphere appearance
- magnetic field → outer magnetic-field effect
- rotation → planet rotation speed

The user should immediately see the consequences of changes.

---

## 16. What If?

Create interactive presets:

```text
Gravity +50%
Lower Oxygen
Closer to Star
Slower Rotation
Higher Atmospheric Pressure
```

Clicking one should actually modify Planet Lab state.

---

## 17. AI — Current Phase

**Do not integrate an external AI API yet.**

Create a local explanation generator in:

```text
src/utils/planetExplanation.js
```

It should generate deterministic educational explanations from the current planet values.

Structure the code so a future AI service can replace this function.

Do not pretend that the local generator is an actual AI model.

---

## 18. Scientific Disclaimer

Display this wherever simulation results are shown:

> Cosmos Hub's planet simulation uses simplified educational estimates. Real planetary climate, atmosphere, and habitability depend on many interacting variables and cannot be determined from this simulator alone.

---

## 19. No Backend Rule

Until explicitly asked otherwise:

**DO NOT create or add:**

```text
backend/
FastAPI
Python
PostgreSQL
Supabase
API server
authentication server
server-side AI
database migrations
backend routes
```

The current application must run entirely with:

```text
npm install
npm run dev
```

---

## 20. Future-Proofing

Although there is no backend now:

- keep API-like logic in `services/`
- keep calculations in `utils/`
- keep data separate from UI
- keep persistence behind `storageService`
- avoid coupling components to localStorage
- use clean data models

This allows future backend integration without major frontend restructuring.
