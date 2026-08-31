@AGENTS.md
# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**RentFlow** — a car rental booking platform. Clients browse cars, check availability on a calendar, create a booking, and pay a **deposit (kapar)** via Paysera. A booking is only confirmed after a verified server-to-server callback from Paysera. Two roles: **user** (books) and **admin** (manages the fleet, bookings, and stats).

The product UI and user-facing copy are in **Albanian**. Code, comments, commits, and identifiers are in **English**.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript, React Server Components
- **API:** Next.js Route Handlers + Server Actions
- **Validation:** Zod (server-side, never trust the client)
- **DB / Auth / Storage:** Supabase (Postgres + RLS, Auth, Storage)
- **Payments:** Paysera (deposit flow, s2s callback, signature verification)
- **Email:** Resend + React Email
- **UI:** Tailwind CSS, shadcn/ui, react-day-picker (calendar), Recharts (admin charts)
- **Jobs:** Supabase Edge Functions / pg_cron (expiry, reminders)
- **Hosting:** Vercel · **Monitoring:** Sentry
- **Testing:** Vitest (unit/domain), Playwright (E2E)

## Architecture Principles

1. **Thin handlers, fat lib.** Route handlers only: authenticate, validate (Zod), call a domain function from `lib/`, return a response. Business logic lives in `lib/`, never in handlers — keeps it testable and reusable across Route Handlers and Server Actions.
2. **Payment truth = the callback, not the redirect.** The `accepturl`/`cancelurl` redirects are UX only. Booking state changes to `deposit_paid` **only** from the verified s2s callback.
3. **Concurrency is solved in the DB, not the app.** Anti-overlap is a Postgres `EXCLUDE` constraint, not an application lock — serverless runs parallel instances.
4. **Authorization is layered (defense in depth):** middleware → server guard → RLS. RLS is the source of truth; the other two are convenience/early-exit.
5. **Server-side validation always.** The calendar disabling taken dates is UX; availability is re-validated server-side before every booking insert.

## Data Model (Supabase)

- **profiles** — `id (fk auth.users)`, `full_name`, `role (user|admin)`, `created_at`
- **cars** — `id`, `make`, `model`, `year`, `plate (unique)`, `daily_price`, `deposit_amount`, `status (available|maintenance|retired)`, `image_url`, `created_at`
- **bookings** — `id`, `car_id`, `user_id`, `start_date`, `end_date`, `total_price`, `deposit_amount`, `status (pending|deposit_paid|confirmed|cancelled|completed)`, `expires_at`, `created_at`
- **payments** — `id`, `booking_id`, `paysera_order_id (unique — idempotency key)`, `amount`, `currency`, `type (deposit|balance)`, `status (initiated|paid|failed|refunded)`, `paysera_payload (jsonb)`, `created_at`, `paid_at`

### Critical DB constraints

```sql
-- Anti-overlap: DB refuses two active bookings on the same car/period
ALTER TABLE bookings ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (
    car_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status IN ('deposit_paid','confirmed'));
```

`paysera_order_id` is **unique** — this is the payment idempotency key.

## Booking State Machine

```
pending → deposit_paid → confirmed → completed
pending → (timeout / payment fail) → cancelled
```

- `pending` is created with `expires_at` (~15 min); the car is held.
- `deposit_paid` is set **only** by the verified Paysera callback; triggers a confirmation email.
- `cancelled` comes from cron (timeout) or a failed payment; the car is released + email.

## Authorization Model

| Table | User | Admin |
|-------|------|-------|
| cars | SELECT (public) | SELECT / INSERT / UPDATE / DELETE |
| bookings | SELECT/INSERT only `user_id = auth.uid()` | SELECT / UPDATE all |
| payments | SELECT own (via booking) | SELECT all |
| profiles | SELECT/UPDATE own | SELECT all |

- Middleware guards `/admin/*` and `/dashboard/*` (session check before render).
- `requireAdmin()` guard runs in every admin route handler before any mutation (returns 403).
- The Paysera callback has no user session → uses the `service_role` client (bypasses RLS), isolated in `lib/supabase/admin.ts`. **Never import the service-role client into client components or expose it to the browser.**

## Paysera Callback — Non-Negotiable Rules

The callback handler (`app/api/payments/paysera/callback/route.ts`) must, in order:

1. **Verify the signature** (`ss1`/`ss2`) before anything else. Invalid → return 400, no DB writes.
2. **Be idempotent** on `paysera_order_id`. A repeated callback must not double-process; return `OK`.
3. **Validate the amount** against the expected value in the DB — never trust the amount in the request body.
4. Update `payment → paid` and `booking → deposit_paid` in a **single transaction**.
5. Trigger the confirmation email **async / non-blocking** — an email failure must never fail the payment confirmation.
6. Return the plain text `OK` response Paysera expects.

## Folder Structure

```
app/
  (public)/cars/                  # listing + [id] detail (calendar overlap)
  (public)/booking/[id]/          # booking flow + payment status
  (auth)/login, register/
  dashboard/bookings/             # USER: my bookings
  admin/                          # ADMIN: middleware-guarded
    page.tsx                      #   stats dashboard
    cars/ (page + new)            #   CRUD
    bookings/                     #   all bookings
  api/
    bookings/route.ts             # POST, GET
    admin/cars[/[id]]/route.ts    # POST, PATCH, DELETE
    admin/{bookings,stats}/route.ts
    payments/paysera/{init,callback}/route.ts
  middleware.ts                   # guards /admin/*
lib/
  supabase/{client,server,admin}.ts
  paysera/{sign,verify,buildRequest}.ts
  bookings/{availability,stateMachine}.ts
  email/{send.ts, templates/}
  auth/guards.ts                  # requireAdmin()
  validators/                     # zod schemas
components/{ui, CarCard, AvailabilityCalendar, BookingSummary, admin/}
supabase/{migrations/, functions/{expire-bookings, send-reminders}}
types/database.ts                 # generated Supabase types
```

## Conventions

- **Supabase clients:** use `lib/supabase/server.ts` in Server Components and route handlers; `client.ts` only in client components; `admin.ts` (service role) only in the Paysera callback and trusted server jobs.
- **Validation:** every route handler and server action validates input with a Zod schema from `lib/validators/`. Never trust client-sent prices, dates, or amounts — recompute server-side.
- **Money:** store as `numeric` in Postgres; never use floats for amounts. Deposit is computed from the car's `deposit_amount`, never from the client.
- **Types:** keep `types/database.ts` generated from Supabase (`supabase gen types`). Don't hand-edit.
- **Forms:** React Hook Form + Zod resolver. Mutations via Server Actions where practical.
- **No HTML `<form>` reliance on default submit** in interactive React — use explicit handlers.
- **Errors/empty states:** user-facing copy in Albanian, in the interface's voice — say what happened and how to fix it; don't apologize, don't be vague.

## Commands

```bash
npm run dev            # local dev
npm run build          # production build
npm run lint           # eslint
npm run test           # vitest
npm run test:e2e       # playwright
supabase start         # local supabase
supabase db push       # apply migrations
supabase gen types typescript --local > types/database.ts
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server only — never exposed to client
PAYSERA_PROJECT_ID
PAYSERA_SIGN_PASSWORD            # server only
RESEND_API_KEY
NEXT_PUBLIC_APP_URL              # for accept/cancel/callback URLs
SENTRY_DSN
```

Never commit secrets. `PAYSERA_SIGN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` are server-only and must never reach the client bundle.

## What to Watch For (recurring failure modes)

- Setting `deposit_paid`/`confirmed` from anywhere other than the verified callback.
- Trusting client-sent amounts, prices, or dates instead of recomputing server-side.
- Forgetting idempotency on the callback (double-charging / double-confirming).
- Solving double-booking in app code instead of relying on the `EXCLUDE` constraint.
- Importing the service-role client outside the callback / trusted jobs.
- Hard-deleting a car that has historical bookings — use `status = retired` instead. Hard delete only when the car has zero bookings.
- Making email sending block the payment-confirmation path.
- Relying on UI hiding for authorization without the matching RLS policy + server guard.

⏸️ HUMAN ACTION REQUIRED
Çfarë duhet të bësh TI para se të vazhdojmë:
Si ta konfirmosh: Shkruaj "gati" ose "done" kur t'i kesh kryer këto hapa.

Pse nevojitet: [Shpjego shkurt pse ky hap nuk mund të bëhet automatikisht]