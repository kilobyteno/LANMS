# Changelog

All notable changes to this project will be documented in this file.

## 3.0.0-alpha.11 - 2026-04-16

### Added

- **Initial user bootstrap** — Script and docs to bootstrap an initial user in the DB; tests and refactors around that flow (merged via [#111](https://github.com/kilobyteno/LANMS/pull/111) — adjust org/repo if your remote differs).

### Changed

- **Documentation** — Centralized developer docs under `docs/` (`docs/README.md`, `docs/backend/README.md`, `docs/frontend/README.md`); moved `LEGACY-CODEBASE.md` to `docs/legacy/`; root and app READMEs now point at `docs/` instead of long inline guides.
- **Backend docs** — Environment variables documented; docs updated for env, tests, and bootstrap.
- **CI / release** — Release workflow: add **uv** (`astral-sh/setup-uv@v7`) and run `uv lock` in the backend so `uv.lock` is refreshed during release; ensures uv is available before Node setup.
- **Dependencies** — `uv.lock` updated.

### Fixed

- **Uvicorn** — Replace deprecated `uvicorn_log_config` with `log_config`.
- **Build** — Build script runs steps **sequentially** (fix for parallel/ordering issues).
- Minor typo fix.

## 3.0.0-alpha.10 - 2026-04-14

### Features & product

- **Event articles:** Backend and frontend for articles (organiser list/create/edit; attendee detail), markdown on the article page, styling tweaks, **published-at** on the article form, related API/routing.
- **Version awareness:** Version checker on the attendee layout, version badge prop, hover behavior for new-version messaging, GitHub API changes to reduce rate limiting.
- **i18n:** **Danish** and **German** support, language indicator in the UI, translation updates (including articles).

### Backend & Python tooling

- **Backend:** Switched to **`uv`** and **Python 3.12**.
- **Dependencies:** e.g. `requests` 2.32.5 → 2.33.0; `bcrypt` / `pandas` bumps (per history).
- **Quality:** Pre-commit & Ruff updates, Ruff usage, code style and logging cleanups.

### Frontend & Node

- **Node:** Pinned to **22** (Dockerfile, `.nvmrc`, `package.json`).
- **Tooling:** Vite **5.4.x → 8.0.8** (via dependency updates), Tailwind/Vite config and frontend build-tooling updates; calendar/main updates with dependency work.
- **Notable npm bumps (summary):** axios, lodash, react-router / `@remix-run/router`, rollup, undici, plus various transitive/security-related bumps (brace-expansion, minimatch, follow-redirects, etc.).

### CI, release, and maintenance

- **Release:** Workflow computes and applies release versions.
- **Dependabot:** Monthly schedule; **npm** and **uv** ecosystems; routine GitHub Actions bumps (e.g. `actions/checkout`, `actions/setup-python`, `astral-sh/setup-uv`, `dependabot/fetch-metadata`, `stefanzweifel/git-auto-commit-action`, …).
- **Repo:** LANMS icon assets, legacy codebase reference, CONTRIBUTING update, README Discord link and grammar fixes.
- **Frontend cleanup:** Removed `theme-provider.tsx` (per history).

## 3.0.0-alpha.9 - 2025-01-10

### Changed

- **Automatic Workflow Enhancements**:
  
  - Updated GitHub Actions to track versions via a new file instead of unnecessary updates to other files.
  - Improved tagging mechanism for labeling updates.
  
- **Frontend Appearance and Functionality Enhancements**:
  
  - Updated version in `package.json` and `package-lock.json`.
  - Implemented a new, efficient mechanism for handling app themes.
  - Removed redundant elements to improve system performance.
  
- **Interface Component Refinement**:
  
  - Enhanced the interface with aesthetic improvements and added icons to buttons for better user interaction.
  
- **Update Changelog Page Enhancements**:
  
  - Introduced a new badge to indicate pre-releases.
  - Improved layout for a more user-friendly experience.
  

### Added

- **Dynamic Versioning**:
  
  - Introduced a new file to store the current version number.
  - Enabled the backend to dynamically pick up the latest versions from this file for flexible versioning.
  
- **Language Localization Improvements**:
  
  - Added a new translation key for English, Norwegian, and Swedish languages.
  
- **Theme-Persistence Across Sessions**:
  
  - Introduced a `ThemeProvider` component for managing theme states using React Context.
  - Added a custom hook `useTheme` for easier access to theme context.
  - Enabled theme persistence based on user preferences and system settings.
  

### Removed

- **Cleaning up Old Code**:
  - Removed outdated and unnecessary theming code to streamline theme management.
  

### Fixed

- **Detailed Update Logs**:
  - Enhanced the changelog with better version recording and detailed descriptions of updates.
  

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.8...3.0.0-alpha.9

## 3.0.0-alpha.8 - 2025-01-10

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.7...3.0.0-alpha.8

## 3.0.0-alpha.7 - 2025-01-10

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.6...3.0.0-alpha.7

## 3.0.0-alpha.6 - 2025-01-10

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.5...3.0.0-alpha.6

## 3.0.0-alpha.5 - 2025-01-10

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.4...3.0.0-alpha.5

## 3.0.0-alpha.4 - 2025-01-10

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.3...3.0.0-alpha.4

## 3.0.0-alpha.3 - 2025-01-09

### Changed

- **Enhanced GitHub Action Workflow**:
  
  - Updated to use a new environment variable for more flexible management.
  - Now handles updates to critical files (`package.json`, `backend/config.py`) that track software versioning.
  - Improved automation ensures effective tracking and management of software changes.
  
- **Frontend Markdown Component Styling**:
  
  - Slight adjustments to the `ReactMarkdown` component for a more refined display experience.
  
- **Styling Adjustments to the Changelog Page**:
  
  - Increased the size of the main title (`CardTitle` component) to improve readability and visual appeal.
  

### Added

- **Utility Function Simplification**:
  - Consolidated date-utilities into `frontend/src/lib/utils.ts` for better organization and maintainability.
  

### Removed

- **Redundant Files**:
  - Deleted the redundant file `frontend/src/lib/date.ts` to eliminate duplications in the codebase.
  

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.2...3.0.0-alpha.3

## 3.0.0-alpha.2 - 2025-01-02

### Changed

- **Release Workflow Revamped**:
  
  - Trigger for the release procedure updated from `released` to `published`.
  - Source data reference branch changed from `main` to `develop`.
  
- **API Endpoints Enhanced**:
  
  - Event interest endpoint routes updated from `/{event_id}` to `/events/{event_id}/interests` for improved clarity and coherence.
  
- **Frontend API Calls Altered**:
  
  - Updated paths in `event-interest.ts` to align with the new endpoint structure.
  
- **Frontend Imports Reordered and Formatted**:
  
  - Removed unnecessary import statements from `nav-user.tsx`.
  - Styled `changelog.tsx` file for consistency.
  
- **Code Readability Enhanced**:
  
  - Minor adjustments to indentation and line formatting across the codebase.
  

### Added

- **New User Interest Feature**:
  
  - Introduced `event_interests` table to capture user preferences related to events.
  - Ensured foreign key constraints are upheld.
  
- **Healthchecks Implemented**:
  
  - Added healthchecks to Docker Compose files for frontend and backend services.
  
- **Docker Solutions for PostgreSQL**:
  
  - Created Docker and Docker Compose files for PostgreSQL with optimized configurations.
  

### Fixed

- **Improved Import Arrangement**:
  - Re-associated import commands in `__init__.py` to include the new `event_interest` model.
  

### Removed

- **Housecleaning of Unused Files**:
  - Deleted unused files `status.ts` and `Profile.tsx`.
  

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.1...3.0.0-alpha.2

## 3.0.0-alpha.1 - 2024-12-28

### New features

#### Frontend Updates

- **UI Enhancements**:
  - Added a complete UI for the frontend.
    
  - Enabled switching between organizations and their associated events.
    
  - Implemented localization with support for:
    
    - English
    - Norwegian
    - Swedish
    
  - Added a theme selector with options for:
    
    - Dark Mode
    - Light Mode
    - System Default
    
  - Introduced a changelog page that fetches release updates directly from GitHub.
    
  

#### Backened Updates

##### Organizations Management

- Added functionality for managing organizations:
  - Create new organizations.
  - Update organization details.
  - Delete organizations.
  

##### Events Management

- Added event management capabilities:
  - Create new events.
  - Update event details.
  - Delete events.
  - View events as attendees.
  

##### Event Interest

- Added the ability to manage interest in events:
  - Create event interest.
  - Update event interest.
  

##### User Authentication

- Enhanced user authentication features:
  - User registration (sign up).
  - Change password functionality.
  - Password reset and forgot password support.
  - Login and logout capabilities.
  

**Full Changelog**: https://github.com/kilobyteno/LANMS/compare/3.0.0-alpha.0...3.0.0-alpha.1

## LANMS 3.0.0-alpha.0 - A New Beginning - 2024-09-26

We are thrilled to announce the upcoming release of **LAN-party Management System (LANMS) 3.0**, a modern, web-based application designed to help you effortlessly manage your LAN-party events. Whether it's tournaments, games, tickets, or participants, LANMS is crafted to make event organization a breeze.

### What is LANMS?

LANMS is your go-to solution for managing LAN-party events, designed to handle everything from game setup to participant management.

LANMS will offer both **self-hosted** and **cloud-based** options, giving you the flexibility to manage your events the way you prefer.

### Current Project Status

LANMS 3.0 is currently **under active development** and not yet ready for production use. Originally started in February 2023, the project encountered delays due to unforeseen circumstances. However, as of **September 25th, 2024**, we have officially restarted development from scratch, focusing on making LANMS 3.0 more **user-friendly, scalable, flexible,** and **open-source**.

Our goal is to deliver an advanced, community-driven platform that sets a new standard in LAN-party management.

### A Brief History

LANMS has a rich history, with its origins dating back to **2014**, when [dsbilling](https://dsbilling.no) joined forces with [chilloman](https://github.com/chilloman) to build a system for a LAN-party event. The original version, **LANMS 1.0**, was heavily hardcoded for a specific event and remains closed-source for now.

In **February 2015**, the project evolved into **LANMS 2.0**, a more flexible and scalable version, which was maintained privately until now and will become **open-source** in late September 2024 as **LANMS Legacy**.

LANMS 3.0, a complete rewrite of the previous version, marks a significant leap forward. Built with modern technologies and a strong focus on flexibility and user experience, it promises to be a powerful tool for LAN-party organizers across the globe.

### What’s Next?

We are dedicated to delivering a robust platform, and we invite the community to follow our progress as we work toward the first public release of LANMS 3.0. Stay tuned for updates and opportunities to contribute!


---

**Follow development on [GitHub](https://github.com/kilobyteno/lanms), join us on [Discord](https://kilobyte.no/discord) and help us in building the future of LAN-party management!**
