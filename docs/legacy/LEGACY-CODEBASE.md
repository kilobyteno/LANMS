# LANMS Legacy — Codebase Reference

This document describes how **LANMS Legacy** (LAN-party Management System) is structured, what each major part does, and how requests, data, and integrations fit together. **Section 2 is the product/business view** (rules, lifecycles, operator toggles); later sections are architecture and implementation detail. Use it when rebuilding the product or onboarding to the stack.

The upstream package name is `kilobyteno/lanms-legacy`. The project README notes this tree is **unmaintained**; a newer LANMS lives at [kilobyteno/LANMS](https://github.com/kilobyteno/LANMS).

---

## 1. What the application is

LANMS is a **monolithic Laravel web application** for running a LAN event:

- **Public site**: schedule, news, sponsors, crew listing, tournament (“compo”) catalog, optional CMS pages, member signup/login, profile, seat map and reservations, payments, tickets, self check-in.
- **Admin panel** (`/admin/*`): full CRUD for seating layout, reservations, check-in, compos, news, crew, sponsors, users/roles, invoices, outbound email/SMS trials, system settings, activity logs.

There is no separate SPA frontend in this repo; the UI is **server-rendered Blade** under two themes.

---

## 2. Product: how it works (business logic)

This section is the **behavioral model**: what actors do, which rules gate them, and how money and “edition year” flow through the app. It reflects what the PHP code enforces today.

### 2.1 Event edition (“this year”)

- Most attendee features are scoped to a **single active year** stored in settings: `SEATING_YEAR`. Reservations, tickets, compos, check-ins, and visitors all filter on this value (and/or the reservation’s own `year` column).
- Operators advance an event by updating settings (and typically seating/compo content), not by implicit calendar rollover.

### 2.2 Members, profiles, and referrals

- **Accounts** are normal attendees/staff with rich profiles (name, birthdate, address, phone, optional visibility flags, language, theme).
- **`REFERRAL_ACTIVE`**: if on, visiting `/r/{code}` stores `referral` in session and sends the user to **signup** so organizers can attribute registrations (no extra logic beyond storing the code for that session).
- **Birthdate and address** are required before **reserving seats** (for both the logged-in “buyer” and the “seat holder” when they differ).

### 2.3 Seat map, ticket types, and pricing

- **Layout**: seats belong to **rows** (ordered for display). Each seat has a **ticket type** with `price`, `active`, and optional `allow_entrance_payment`.
- **Public tickets page** lists active ticket types by ascending price (informational; actual seat prices come from the seat’s type).
- **Map visibility** is controlled by settings such as `SEATING_SHOW_MAP` / `SEATING_OPEN` (see below).

### 2.4 Seat reservation lifecycle

**Global switches (settings)**

- **`SEATING_OPEN`**: when false, reservation and payment flows refuse to proceed.
- **`SEATING_SEAT_EXPIRE_HOURS`**: window for **unpaid / temporary** holds.

**Roles**

- **`reservedby`**: the member performing the action (payer / booker).
- **`reservedfor`**: the member who will **occupy** the seat (can be the same person or someone else—e.g. parent booking for a child).

**States (`status_id`)**

| ID | Meaning in code |
|----|-----------------|
| 2 | **Temporary reserved** — hold on the seat until payment or expiry |
| 1 | **Reserved** (finalized) — after successful online payment *or* pay-at-door path |

**Rules when creating a hold (`ReserveSeatingController@reserve`)**

1. Seat exists; its ticket type exists and is **active**.
2. Seat has **no** reservation for the current `SEATING_YEAR`.
3. Booker has **Stripe customer** path checked: any **unpaid non-draft/non-void** Stripe invoice blocks new reservations (debt gate).
4. Booker: **≤ 5** reservations-for-others this year; **≤ 1** “own” seat this year when reserving for self (`reservedfor == self`).
5. Seat holder (`reservedfor`): must have birthdate + address; **≤ 5** reservations where they appear as holder; **≤ 1** seat where they are the primary occupant (`ownReservationsThisYear`).
6. New row is **`status_id = 2`**, `year = SEATING_YEAR`.

**Expiry and reminders (`lanms:desr`, hourly)**

- Only **`status_id = 2`** rows are processed.
- Reminder: when **24 full hours remain** before expiry and `reminder_email_sent == 0`, send `SeatReservationExpires` to **`reservedby`** and set the flag.
- Expiry: when time left hits **0**, the reservation is **deleted**, seat released, and `SeatReservationExpired` notifies **`reservedby`**.
- Expiry moment is computed from `created_at + SEATING_SEAT_EXPIRE_HOURS`.

**Pay now (Stripe)**

- Only **`reservedby`** may pay. Amount is the seat ticket type’s `price`; currency from `MAIN_CURRENCY`.
- Flow: create PaymentMethod + PaymentIntent, confirm; on success create **`SeatPayment`** (Stripe charge id), **`SeatTicket`** (random numeric **barcode**), set reservation **`status_id = 1`**, link `payment_id` and `ticket_id`.

**Pay at door / entrance (`paylater`)**

- Allowed only if the ticket type has **`allow_entrance_payment`**.
- Creates **`SeatTicket`** and sets **`status_id = 1`** but **does not** create `SeatPayment` (`payment_id` stays empty/zero). Messaging distinguishes this from fully paid online.

**Changing mind before paying online (`changepayment`)**

- If still within the temporary window, staff/booker can **delete the generated ticket**, set reservation back to **`status_id = 2`** and clear `ticket_id` so they can pay online instead of entrance—only while not expired.

### 2.5 Tickets, PDFs, and check-in identifiers

- Each **`SeatTicket`** gets a numeric **barcode** (used as **wristband / band number** at check-in) and a short random **`code`** (hex string generated on create) used in **self check-in URLs**.
- **PDF download** of a ticket is allowed for the **`reservedfor`** user when a ticket exists.

### 2.6 Check-in (door)

**Staff (`Admin\CheckinController`)**

- Requires Sentinel permission set **`admin.checkin.*`**.
- Lists check-ins for the year and tickets **without** check-in.
- Lookup by **barcode**; records **`Checkin`** with `bandnumber`, links ticket → check-in.

**Self-service (`SelfCheckinController`)**

- User enters ticket **`code`** (not barcode).
- Allowed only if: reservation has a **`payment`** record (so **pay-later / entrance-only** tickets **fail** this path—they need staff), attendee **age ≥ 15**, and account has **`phone_verified_at`**.
- **Authy** SMS verification runs; on success, creates **`Checkin`** same as staff path.
- **Implementation note:** `SeatTicket.user_id` is set to the **logged-in user who created the ticket** (usually the payer), not necessarily **`reservedfor`**. Self check-in still reads **age / phone** from `ticket->user`. If you book seats for someone else, verify whether that matches your intended policy when rebuilding.

**Visitors**

- Staff can register **non-seat** entrants (`Visitor`: name, phone, band number) for tracking/wristband—parallel to seat tickets.

**Broken band**

- If a physical band number must be replaced after check-in, staff logs a **`BrokenBand`** row (old → new number) and updates **`Checkin.bandnumber`**, with uniqueness checked for the year.

### 2.7 Compos (tournaments)

- **`Compo`** rows carry schedule fields: `first_sign_up_at`, `last_sign_up_at`, start/end, optional **`max_signups`**, **`signup_size`** (roster size), **`signup_type`**.
- **`signup_type == 1`**: **team** signup—user must join an existing **`CompoTeam`** such that after adding them, player count **equals** `signup_size`; must accept rules checkbox.
- Other signup types: individual signup with rules acceptance only.
- One signup per user per compo; signups store **`year`** (again tied to `SEATING_YEAR`).
- Members **create teams**, attach other users as players (notifications on add/remove); teams are then selected when signing up for team compos.
- Compos may link to external brackets (Challonge / Toornament IDs in the model) for display/ops—not deeply wired in the snippets above.

### 2.8 Content, crew, sponsors

- **News**: published posts + categories for announcements.
- **Pages**: arbitrary CMS HTML; catch-all **`/{slug}`** after all other routes.
- **Crew**: public directory + admin CRUD for people, categories, and skills.
- **Sponsors**: sponsor logos/links for the public sponsor page.

### 2.9 Billing beyond seats

- Users can have **Stripe customers**, saved **cards**, and see **invoices/charges** under account billing.
- **Unpaid Stripe invoices** (non-draft, non-void) block **new seat reservations** for that user (see §2.4).

### 2.10 Privacy, GDPR, and housekeeping

- Middleware **`gdpr.terms`**: can force flows until terms/consent are recorded (package + `User` GDPR fields).
- **`User`** supports **data export** and **anonymization** (scheduled `gdpr:anonymizeInactiveUsers`).
- **`lanms:updatenotifications`** (hourly): for users with a Stripe customer, scans open invoices and raises **`InvoiceUnpaid`** in-app notifications when missing.
- **`lanms:dnau`**, **`lanms:cleanupactivity`**, **`lanms:checkbirthdate`** and other `lanms:*` commands handle additional housekeeping (see each command’s implementation).

### 2.11 Operator toggles (representative settings)

| Key | Role |
|-----|------|
| `SEATING_OPEN` | Master switch for seat booking/payment |
| `SEATING_YEAR` | Active LAN edition |
| `SEATING_SEAT_EXPIRE_HOURS` | Temporary hold length |
| `SEATING_SHOW_MAP` | Map visibility |
| `MAIN_CURRENCY` | Stripe amounts |
| `REFERRAL_ACTIVE` | Referral link → signup |
| `LOGIN_ENABLED` | Auth availability (used elsewhere in app) |

---

## 3. Technical stack

| Layer | Choice |
|--------|--------|
| Language / runtime | PHP `^8.0` |
| Framework | Laravel `^8.x` |
| Namespace / app root | `LANMS\` → `app/` |
| Auth (web) | [Cartalyst Sentinel](https://github.com/cartalyst/sentinel) (not Laravel’s default `auth` guard for primary login) |
| Auth (API) | Laravel Passport (OAuth2 client credentials on some routes) |
| Permissions | Sentinel roles + `hasAccess('admin')` for back office |
| Database | MySQL (configured via `.env`; `Schema::defaultStringLength(191)` in `AppServiceProvider`) |
| Settings | DB-backed key/value via `anlutro/l4-settings` (facade `Setting`) |
| Payments | Cartalyst Stripe + Stripe customer on `User` |
| Mail | Postmark (`coconutcraig/laravel-postmark`) |
| SMS | Twilio SDK |
| 2FA | Authy (`authy/php`) |
| PDF | `barryvdh/laravel-dompdf` |
| Images | Intervention Image (+ image cache) |
| Audit log | `spatie/laravel-activitylog` (with `ActivityObserver`) |
| GDPR tooling | `dialect/laravel-gdpr-compliance` on `User` (portable export, anonymization) |
| Error tracking | Sentry Laravel |
| Themes | `igaster/laravel-theme` — themes `vobilet` (public) and `vobilet-admin` |
| Assets | Laravel Mix (`webpack.mix.js`) |

---

## 4. Repository layout (high signal)

```
app/
  Console/Commands/     # Scheduled + maintenance Artisan commands (lanms:*, etc.)
  Http/
    Controllers/        # Feature folders: Admin, Member, Seating, Compo, News, Crew, Billing, API, …
    Middleware/         # Sentinel*, GDPR terms, localization, HTTPS, Authy/Twilio env guards, …
    Requests/           # Form request validation (often per-area)
    Resources/          # API JSON transformers
  Notifications/        # Laravel notifications (e.g. seat reservation expiry)
  Observers/            # e.g. ActivityObserver
  Policies/             # Mostly unused / stubbed
  Providers/            # App, Auth (Passport), Route, Event, Config
  *.php                 # Eloquent models at package root (User, Seats, SeatReservation, Compo*, …)

routes/
  web.php               # Almost all HTML routes; catch-all page route MUST stay last
  api.php               # /api/v1 (public-ish) and /api/v2 (Passport client)
  console.php           # Closure commands if any

resources/
  views/
    vobilet/            # Public theme Blade
    vobilet-admin/      # Admin theme Blade
    vendor/             # Published mail / package views
  lang/                 # en, nb, sv (+ theme strings)

database/
  migrations/           # Schema evolution from ~2015 onward
  seeders/              # Demo data: users, seats, news, settings, pages, crew, compo, …

config/                 # Standard Laravel + packages (Stripe, Postmark, Sentinel, Passport, …)
```

---

## 5. HTTP routing model

- **Controllers** live under `LANMS\Http\Controllers` with route namespace set in `RouteServiceProvider`.
- **`routes/web.php`** defines:
  - Debug-only helpers when `app.debug` is true (e.g. `/resetdb` — dangerous in production).
  - Public routes with middleware `setTheme:vobilet`.
  - `account/*` groups: guests (signin/signup/reset), authenticated account, billing, seating, compo, etc.
  - **Admin**: prefix `admin`, middleware `sentinel.auth`, `sentinel.admin`, `setTheme:vobilet-admin`, `gdpr.terms`.
  - **`/ajax/*`**: JSON helpers for autocomplete (usernames, rows, seats, crew metadata) — requires `sentinel.auth` + `ajax.check`.
  - **Last route**: `GET /{slug}` → `PagesController@show` for CMS pages. Any new public top-level path must be registered **above** this or it will be swallowed as a page slug.

- **`routes/api.php`** is mounted under `/api`:
  - `v1`: basic stats/news endpoints and `/user` (thin API).
  - `v2`: example + check-in endpoints protected with Passport `client` middleware.

---

## 6. Middleware and cross-cutting behavior

Defined in `app/Http/Kernel.php`:

- **Global**: trusted proxies, CORS, maintenance, trimming, etc.
- **Web group**: session, CSRF, errors, **localization**, **HTTPS helper**, Passport `CreateFreshApiToken` (for same-site API token bridging).
- **Route middleware** (selection):
  - `sentinel.auth` / `sentinel.guest` — Sentinel session state.
  - `sentinel.admin` — must be logged in **and** `Sentinel::getUser()->hasAccess('admin')`.
  - `setTheme:{name}` — selects Blade theme package.
  - `gdpr.terms` — redirects until user accepts required terms (`RedirectIfUnansweredTerms`).
  - `client` — Passport client credentials for API v2.
  - `checkauthyenv` / `checktwilioenv` — gate features if env not configured.

---

## 7. Authentication, roles, and admin access

- **User model**: `app/User.php` implements Sentinel’s `UserInterface` and related contracts, uses **soft deletes**, **UUIDs** (`binarycabin/laravel-uuid`), **Passport** `HasApiTokens`, **activity log**, **searchable**, and GDPR **Portable** / **Anonymizable**.
- **Login lifecycle**: `Member\AuthController` and related controllers under `Http/Controllers/Member/`.
- **Admin**: not a separate Laravel Guard; it is **any user with Sentinel permission access** including `admin` (see `SentinelAdmin` middleware).
- **2FA**: `Auth\TwoFactorAuthController` + Authy; middleware `checkauthyenv` where needed.
- **Passport**: `AuthServiceProvider` registers Passport routes **only if** `storage/oauth-private.key` and `oauth-public.key` exist — run `php artisan passport:install` when setting up API OAuth.

---

## 8. Domain modules (how features map to code)

### 7.1 Seating and tickets

Conceptual model:

- **Seat rows** (`SeatRows`) → **Seats** (`Seats`, slugged names) → each seat has a **ticket type** (`TicketType`) with pricing semantics.
- **SeatReservation** links a seat to **reservedby** / **reservedfor** users, **status** (`SeatReservationStatus`), optional **SeatPayment** and **SeatTicket**.
- **Year scope**: reservations use a `year` column; model scopes compare to `Setting::get('SEATING_YEAR')` so each LAN edition can reuse the same schema.

User-facing flow (typical):

- Browse map: `Seating\ReserveSeatingController`
- Pay or pay later: `Seating\PaymentSeatingController` (Stripe)
- Ticket PDF / download: reservation controller + DomPDF / barcode

Admin:

- CRUD rows, seats, ticket types, styling map, reservations, broken-band workflow, check-in, visitor check-in, print seat labels.

**Background**: `lanms:desr` (delete expired seat reservations), notifications for expiring holds, etc.

### 7.2 Compos (tournaments)

- Models such as `Compo`, `CompoSignUp`, `CompoSubmission`, team-related controllers under `Http/Controllers/Compo/`.
- Members sign up per compo slug; admins manage compos, duplicates, and signups (`Admin\CompoAdminSignUpController`).

### 7.3 News and sponsors

- `News`, `NewsCategory` + `News\*Controller` for public and admin.
- `Sponsor` + `Admin\SponsorController` — public sponsor page and admin CRUD.

### 7.4 Crew

- `Crew`, `CrewCategory`, `CrewSkill` — directory on the public site (`/crew`) and full admin for categories, crew members, and skills.

### 7.5 CMS pages

- `Page` model + `Page\PagesController`.
- **Admin** manages pages; **public** resolves `/{slug}` at the bottom of `web.php`.

### 7.6 Members and social layer

- Profiles (`Member\MemberController`), referrals (`/r/{code}`), notifications, search, account GDPR export/delete (`GdprController`).

### 7.7 Billing (Stripe)

- User Stripe customer linkage on the `User` model; `Billing\*` controllers for cards, invoices (member + admin invoice management where present).
- Uses Cartalyst Stripe Laravel facade in several places.

### 7.8 Operations / system

- **Settings UI**: `Admin\SettingsController` editing DB settings (not just `.env`).
- **Info** blocks: `Info` model + `Admin\InfoController` for editable informational snippets.
- **Logs**: `Admin\LogController` (log viewer package), activity log viewer on `AdminController`.
- **Email / SMS**: admin tools to compose sends (marketing/ops — review before production use).

---

## 9. Configuration and environment

- **`.env`**: See `.env.example` for app name, DB, mail (Postmark), Stripe, Sentry, Twitter/Facebook placeholders, Twilio, Authy, Postmark token.
- **Runtime settings**: Many behavioral toggles and strings live in the **`settings` table** and are read via `Setting::get(...)`. Seating year, branding, and feature flags are commonly stored there.
- **Locale**: `config/app.php` defines `locale` from `APP_LANGUAGE`, supported `locales` (en, nb, sv) and `themes` for user preference.

---

## 10. Console tasks and scheduler

`app/Console/Kernel.php` schedules:

| Schedule | Command / purpose |
|----------|-------------------|
| Every minute | `lanms:checkschedule` |
| Hourly | `lanms:desr` (expired reservations), `lanms:updatenotifications` |
| Daily | `lanms:dnau`, GDPR anonymize inactive users, `lanms:cleanupactivity`, `lanms:checkbirthdate` |

**Deploy / upgrade command**: `php artisan lanms:update` runs migrations, optional debug seed of settings, permission refresh, info/settings description refresh, housekeeping, `storage:link`, and updates stored `APP_VERSION` from git metadata where applicable.

Other commands live under `app/Console/Commands/` (permissions refresh, version, non-activated user cleanup, etc.).

---

## 11. API surface

- **`/api/v1/*`**: lightweight JSON (stats, news pagination). Uses default `api` middleware group (throttle + bindings).
- **`/api/v2/*`**: intended for **machine clients** using **Passport client credentials** (`CheckClientCredentials`), e.g. check-in lookups.

For a greenfield rewrite, treat v2 as the sketch of a “certified client” API pattern; v1 is closer to public feed endpoints.

---

## 12. Data layer notes

- Migrations are numerous and historical; **order matters**. Fresh installs: `php artisan migrate` then `php artisan db:seed` (see `DatabaseSeeder` for the list).
- Seeders create an initial admin user, demo seating, news, pages, crew, compo, email templates, ticket types — **not** safe to run blindly on production without review.
- Several Eloquent relations in older models use short class names like `'User'` in `hasOne` — Laravel resolves them via legacy conventions; newer code should prefer `User::class`.

---

## 13. Frontend assets

- `webpack.mix.js` drives JS/CSS compilation from `resources/js` / `resources/sass` (typical Laravel 8 layout).
- Run `npm install` / `npm run dev` (or `prod`) when changing bundled assets.

---

## 14. Testing and CI

- `phpunit` / `tests/` exist but are minimal (`ExampleTest`-style stubs).
- GitHub Actions workflows under `.github/workflows/` include Laravel-oriented CI and release automation; consult those YAML files when reproducing pipelines.

---

## 15. Mental model: one request through the stack

1. **Web** request hits `public/index.php` → bootstrap → `Kernel` global middleware.
2. **Router** matches `routes/web.php`; theme middleware selects **vobilet** or **vobilet-admin**.
3. **Sentinel** establishes whether the user is authenticated; **GDPR** middleware may force terms acceptance.
4. **Controller** loads **Eloquent** models; mutating actions often use **Form Requests** for validation.
5. **Stripe / Postmark / Twilio / Authy** are invoked from controllers or notifications.
6. **Blade** renders with translations under `resources/lang/*`.
7. **Activity log** records changes where models use `LogsActivity` and the observer is active.

---

## 16. If you rebuild from scratch (checklist)

This is not prescriptive architecture — it captures **feature parity** the legacy app implements:

1. **Identity**: Registration, activation, password reset, optional 2FA, roles/admin separation, API tokens if you still need machine clients.
2. **Event edition model**: Years/editions drive seating and reservations; avoid hard-coding a single event instance.
3. **Seating**: Graph of rows/seats, reservation states, hold expiry, payments, downloadable/bar-coded tickets, check-in (admin + self-service), optional visitor records.
4. **Compo**: Tournament lifecycle, team/signup rules, admin overrides.
5. **Content**: News, optional CMS pages, sponsors, crew directory.
6. **Billing**: Customer vault, cards, invoices — or replace with a simpler PSP if scope allows.
7. **Compliance**: Export/delete, consent tracking, anonymization policy for dormant accounts.
8. **Observability**: Error tracking, audit trail for admin actions.
9. **Ops**: Scheduled jobs for expirations, GDPR tasks, notification digests.

Prefer **explicit route files** (or versioned API routers) over a single megabyte-scale `web.php` in a new system; keep **catch-all page routes** isolated and registered last.

---

## 17. Key files to open first

| File | Why |
|------|-----|
| `routes/web.php` | Full public + account + admin map |
| `app/Http/Kernel.php` | Middleware contract |
| `app/User.php` | Auth, Stripe, GDPR, activity, API tokens |
| `app/SeatReservation.php`, `app/Seats.php` | Core seating domain |
| `app/Console/Kernel.php` | Schedules |
| `app/Console/Commands/Update.php` | Deployment expectations (`lanms:update`) |
| `database/seeders/DatabaseSeeder.php` | What a blank demo DB contains |

---

*Generated as a structural reference for LANMS Legacy; adjust if you fork or modify the tree.*
