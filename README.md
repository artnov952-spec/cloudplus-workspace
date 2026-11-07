# CloudPlus Workspace

Browser mini-app on the CloudPlus UPMH / ERP UI Kit. Calendar, company context and an isolated local simulation of nearby lead selection.

Public demo: https://artnov952-spec.github.io/cloudplus-workspace/
CRM callback: https://artnov952-spec.github.io/cloudplus-workspace/auth/crm/callback.html

**Demo data only. CRM and Mitos are not connected yet.** The callback is a static placeholder, not a working sign-in. No keys, meeting transcripts, real client data or private research are included. Oki-Toki is planned for later.

## Run
Open `docs/index.html` in a recent browser or serve `docs/` locally. No build or dependencies required. GitHub Pages publishes `main:/docs`.

## Scope
Real systems will be read-only. The test mode changes only in-memory synthetic fixtures and resets on tab close. Dates are fixed to 9–13 November 2026 for the demonstration. Distances, meeting duration and buffers are synthetic examples, not real routing or availability.

## Layout
- `docs/index.html`, `app.js`, `app.css`: mini-app shell and UI.
- `docs/engine.js`: isolated local simulation, no network.
- `docs/fixtures.js`: synthetic dataset.
- `docs/css/kit.css`, `docs/js/kit.js`: original kit; project colors in `theme.css`.
- `docs/auth/crm/`: callback placeholder until the CRM server handshake is agreed.

The service key and grant secret must remain on an authorized server, never in this repository or client bundle. No broad browser permissions are required by this website.

## Attribution
ERP UI Kit 1.0 is supplied by CloudPlus. Geist and Geist Mono fonts: SIL Open Font License 1.1; Lucide icons: ISC, as documented by the supplied kit. Public visibility alone does not grant an additional license to CloudPlus-specific code.
