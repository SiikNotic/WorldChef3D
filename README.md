# WorldChef3D

WorldChef3D is a mobile-first 3D restaurant management game designed to run directly in a phone browser and install as a PWA.

## Current gameplay

- 3D restaurant scene with animated customer characters.
- Timed orders, VIP customers, combos and multiple dishes per order.
- Cooking stations, ingredient inventory, recipe upgrades and equipment upgrades.
- Player XP/levels plus separate restaurant progression.
- Restaurant progression requires orders, cash, reputation, station upgrades and recipe mastery.
- Employees: cooks, waiters and cleaners with real gameplay effects.
- Restaurant expansion increases physical 3D floor space and customer capacity.
- Marketing changes customer flow and VIP frequency.
- Contracts with recipe-specific objectives, including the Galactic contract:
  - 500 burgers
  - 500 sodas
  - 300 fries
  - 30 minutes
  - $125,000 reward
- Special customers: VIP, celebrity, royal and food critic.
- Achievements panel and onboarding tutorial.
- Sound effects using the browser Web Audio API.
- Offline progression when staff are hired.
- World progression with New York, Tokyo, Paris, China and Argentina themes.
- Local persistent save data.
- Installable PWA with service worker and app icon.

## Progression

The game is intentionally paced so that a single burger cannot instantly push the player through several progression levels. Higher restaurant levels require combinations of completed orders, money, reputation, equipment and recipe mastery.

## Run

Open index.html in a modern browser. Three.js is loaded from a CDN.

For Android, open the GitHub Pages deployment in Chrome and use Add to Home screen / Install app when the browser offers it.

## Project

- Frontend: HTML, CSS and JavaScript.
- 3D engine: Three.js.
- Persistence: browser localStorage.
- Hosting target: GitHub Pages.
