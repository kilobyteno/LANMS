# Changelog

All notable changes to this project will be documented in this file.

## 3.0.0-alpha.0 - A New Beginning - 2025-01-10

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
