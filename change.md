# Change Log

## Changes made after the last prompt

### Interactive Solar System visual upgrade

I improved the existing home page Solar System visualization without changing unrelated routes or pages.

Updated files:
- `src/components/solar-system/SolarSystemScene.jsx`
  - Replaced the flat horizontal row of colored planet circles with a Sun-centered orbital system.
  - Added a clearly visible central Sun with emissive material and a soft halo.
  - Added subtle orbit rings for each planet so the scene reads as an actual orbiting solar system.
  - Applied a visually normalized size and orbit placement model so Mercury stays small, Jupiter and Saturn read as large, and all planets stay visible.
  - Added planet movement around the orbits and simple rotation behavior for a more dynamic feel.
  - Kept hover and click selection logic in the scene while allowing selected planet feedback.

- `src/pages/Home.jsx`
  - Updated the existing SolarSystemMap wrapper to pass the selected planet id into the scene component for click/select compatibility with the existing selected-world card.

- `src/index.css`
  - Added styling for the new canvas frame sizing and planet label styling so the scene fits the existing visual layout more cleanly.

This work was intentionally limited to the Interactive Solar System experience and did not modify the overall website design, routes, or planet information flow.
