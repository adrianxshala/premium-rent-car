
# Progress — RentFlow

> **Çfarë është ky file:** gjurma e gjallë e progresit, sprint pas sprinti. Përditësohet pas çdo task-u të mbaruar. Statuset: `☐ todo` · `◐ in progress` · `☑ done` · `⊘ blocked`.
> **E vërteta e gjendjes:** ky file, jo kujtesa. Para se të nisësh punë, lexo "Current focus" dhe "Open blockers".

---

## At a glance

| Sprint | Tema | Javë | Status | Progres |
|--------|------|------|--------|---------|
| 1 | Foundation & Auth | 1 | ☑ Done | 14/14 |
| 2 | Booking + Calendar | 2–3 | ☑ Done | 13/13 |
| 3 | Payments (Paysera) | 4 | ⊘ Dropped | — |
| 4 | Email + Jobs | 5 | ☐ Not started | 0/9 |
| 5 | Admin Dashboard | 6 | ☐ Not started | 0/11 |
| 6 | Polish & Ship | 7 | ☐ Not started | 0/10 |

**Current focus:** Sprint 4 — Email + Jobs.
**Last updated:** 2026-06-24

---

## Open blockers

_(Bosh tani. Çdo `⊘ blocked` task përshkruhet këtu me arsye + çfarë e zhbllokon.)_

---

## Sprint 1 — Foundation & Authva
**Qëllimi:** projekt i ngritur, schema + RLS në vend, auth me role funksionale.
**Definition of done:** një user mund të regjistrohet/hyjë; roli ruhet te `profiles`; `/admin/*` është i mbrojtur; migrations aplikohen pa gabime; `types/database.ts` gjenerohet.

### Setup
- ☑ Init Next.js 16 + TypeScript + App Router
- ☑ Tailwind + shadcn/ui (radix-ui) të konfiguruara
- ☑ Struktura e folder-ave sipas CLAUDE.md
- ☑ ESLint + Prettier + scripts në package.json

### Supabase & schema
- ☑ Supabase project (local + dev) i lidhur
- ☑ Migration: tabela `profiles` (id, full_name, role, created_at)
- ☑ Migration: tabela `cars` (me status available|maintenance|retired)
- ☑ Migration: tabela `bookings` (me state + expires_at)
- ☑ Migration: tabela `payments` (me paysera_order_id unique)
- ☑ `types/database.ts` i gjeneruar nga Supabase

### Auth & RLS
- ☑ Supabase Auth: register + login + logout
- ☑ Trigger/handler që krijon `profiles` row me role='user' në signup
- ☑ RLS policies: cars (public read, admin write), bookings (own), payments (own), profiles (own)
- ☑ `proxy.ts` (Next 16) që mbron `/admin/*` dhe `/dashboard/*`
- ☑ `lib/auth/guards.ts` — `requireAdmin()` (403 nëse jo admin)

### Verifikim
- [x] Test manual: signup → profiles row me role='user' ekziston
- [x] Test manual: user pa rol admin merr 403 në një admin route
- [x] Test manual: RLS bllokon leximin e bookings të një useri tjetër

**Notes / decisions Sprint 1:** Middleware u realizua si `proxy.ts` (Next 16 e zhvendos middleware → proxy). Roli ruhet te `profiles` me trigger `handle_new_user`; `is_admin()` SECURITY DEFINER për të shmangur rekursionin e RLS; trigger `guard_profile_role` parandalon privilege escalation.

---

## Sprint 2 — Booking + Calendar
**Qëllimi:** user-i sheh makinat, zgjedh datat në kalendar (overlap UI), krijon booking pending.
**Definition of done:** booking `pending` krijohet me `expires_at`; datat e zëna bllokohen vizualisht dhe re-validohen server-side; EXCLUDE constraint refuzon overlap-et në DB.

### Listing & detail
- ☑ `/cars` — listing me CarCard (çmim, kapar, badge disponueshmërie)
- ☑ Filtra sipas kategorisë (SUV/Sedan/Ekonomik)
- ☑ `/cars/[id]` — detail page me galeri + specifika

### Calendar overlap UI
- ☑ `BookingPanel`/kalendar me react-day-picker (v10, locale sq)
- ☑ Fetch i rezervimeve aktive (deposit_paid, confirmed) → datat e zëna (RPC)
- ☑ Datat e zëna të çaktivizuara vizualisht (nuk klikohen)
- ☑ Llogaritja live e ditëve + total + kapar

### Booking creation
- ☑ EXCLUDE constraint mbi daterange + gist (migration)
- ☑ `lib/bookings/availability.ts` — check overlap server-side
- ☑ `lib/bookings/stateMachine.ts` — transitions të lejuara
- ☑ Zod schema për booking input në `lib/validators/`
- ☑ `POST /api/bookings` — validim + availability + INSERT pending + expires_at
- ☑ `GET /api/bookings` — bookings e user-it (RLS-protected)

### Verifikim
- [x] Test: dy booking overlap → DB e refuzon i dyti (SQLSTATE 23P01, verifikuar në DB lokale)
- [x] Test: çmimi/kapar llogariten server-side, jo nga klienti (`computePrice` nga vlerat e DB-së në route)

**Notes / decisions Sprint 2:**
- Concurrency te DB: `bookings_no_overlap` EXCLUDE USING gist (car_id =, daterange &&) WHERE status in (pending, deposit_paid, confirmed); kërkon `btree_gist`. Range half-open `[)` → kthimi në ditën N e liron N për pickup të ri.
- RLS te `bookings` ekspozon vetëm rrow-et e vetë user-it → shtuar 2 funksione SECURITY DEFINER: `car_booked_ranges` (kalendari, vetëm deposit_paid+confirmed) dhe `is_car_available` (pre-check INSERT, gjithë statuset aktive). Ekspozojnë vetëm data, jo të dhëna useri.
- Pending mban datat për 30 min (`expires_at`); cron i Sprint 4 do i anulojë → liron datat.
- `next/image` remotePatterns: `*.supabase.co` + `127.0.0.1:54321` (Storage).
- react-day-picker v10.0.1.

---

## Sprint 3 — Payments (Paysera)
**Qëllimi:** pagesa e kaparit nga fillimi te konfirmimi i verifikuar.
**Definition of done:** init kthen redirect URL të nënshkruar; callback verifikon signature + idempotency + amount; booking kalon `deposit_paid → confirmed` vetëm nga callback-u.

### Init
- ☐ `lib/paysera/sign.ts` — gjenerim signature (sipas spec Paysera)
- ☐ `lib/paysera/buildRequest.ts` — orderid=booking_id, amount=deposit, URLs
- ☐ `POST /api/payments/paysera/init` — krijon payment `initiated` + kthen redirect
- ☐ Faqja e booking-ut ridrejton te Paysera checkout

### Callback (kritik)
- ☐ `lib/paysera/verify.ts` — verifikim ss1/ss2
- ☐ `POST /api/payments/paysera/callback` (s2s)
- ☐ Verifikim signature → 400 nëse invalid, asnjë write
- ☐ Idempotency mbi paysera_order_id (callback i dyfishtë → OK pa dublim)
- ☐ Amount validation kundrejt vlerës së pritur në DB
- ☐ Transaksion atomik: payment→paid + booking→deposit_paid→confirmed
- ☐ Kthen "OK" plain text

### Redirects
- ☐ `accepturl` (UI confirm) + `cancelurl` (UI cancel) — vetëm UX

### Verifikim
- [ ] Test: callback me signature invalid → 400, asnjë ndryshim
- [ ] Test: callback i përsëritur → s'krijon dublim
- [ ] Test: amount i ndryshuar në payload → refuzohet

**Notes / decisions Sprint 3:** Sprint i HEQUR (2026-06-24). Vendim produkti: pa pagesë online. Booking-u krijohet direkt `confirmed` (auto-confirm), pa kapar. U fshi krejt logjika Paysera (lib/paysera, app/api/payments), tabela `payments` + enum `payment_status` + `confirm_deposit_payment`, kolona `bookings.deposit_amount`, dhe vlera `deposit_paid` nga `booking_status`. Migration: `20260624120000_remove_payments.sql`. Shih Decision log #7.

---

## Sprint 4 — Email + Jobs
**Qëllimi:** njoftime me email + jobs që mbajnë gjendjen të pastër.
**Definition of done:** email dërgohet (async) në konfirmim/anulim/rezervim të ri; cron anulon pending të skaduara dhe dërgon kujtues.

### Email
- ☐ `lib/email/send.ts` — wrapper mbi Resend
- ☐ React Email templates: konfirmim, anulim, kujtues, njoftim admini
- ☐ Trigger email në callback (konfirmim) — async/non-blocking
- ☐ Trigger email te admini për rezervim të ri

### Jobs
- ☐ Edge Function / pg_cron `expire-bookings` (pending → cancelled, liron makinën)
- ☐ Edge Function / pg_cron `send-reminders` (kujtues para pickup)
- ☐ Logjika e lirimit të makinës kur anulohet

### Verifikim
- [ ] Test: booking pending pas expires_at → cancelled nga cron
- [ ] Test: dështimi i email-it nuk prish konfirmimin e pagesës

**Notes / decisions Sprint 4:** _(...)_

---

## Sprint 5 — Admin Dashboard
**Qëllimi:** admini menaxhon flotën, sheh të gjitha bookings dhe statistikat.
**Definition of done:** CRUD makinash funksional me upload foto; soft delete/retire; tabela e të gjitha bookings me filtra; statistika reale.

### CRUD makinash
- ☐ `POST /api/admin/cars` — shton makinë (requireAdmin)
- ☐ `PATCH /api/admin/cars/[id]` — edit / status
- ☐ `DELETE /api/admin/cars/[id]` — retire (soft) ose delete (nëse pa bookings)
- ☐ `/admin/cars` UI — listim + Edit/Retire
- ☐ `/admin/cars/new` — formë shto/edit
- ☐ Upload foto te Supabase Storage

### Bookings & stats
- ☐ `GET /api/admin/bookings` — të gjitha (requireAdmin)
- ☐ `/admin/bookings` UI — tabelë + filtra sipas statusit
- ☐ Ndryshim manual i statusit të një rezervimi
- ☐ `GET /api/admin/stats` — revenue, occupancy, aktive
- ☐ `/admin` dashboard — stat cards + chart (Recharts)

### Verifikim
- [ ] Test: user (jo admin) → 403 në çdo admin endpoint
- [ ] Test: retire makinë me bookings → status retired, jo fshirje

**Notes / decisions Sprint 5:** _(...)_

---

## Sprint 6 — Polish & Ship
**Qëllimi:** prodhim-ready: polished UI, testet E2E, deploy.
**Definition of done:** flow i plotë kalon E2E; responsive + a11y bazik; i deployuar në Vercel me Paysera prod; QA me pagesë reale i kaluar.

### Polish
- ☐ Responsive (mobile → desktop) për të gjitha ekranet
- ☐ Empty + loading + error states me copy në shqip
- ☐ A11y: focus i dukshëm, reduced-motion, kontrast
- ☐ Sentry i integruar

### Testing & deploy
- ☐ E2E (Playwright): full booking flow + callback mock
- ☐ Unit tests për lib/ domain (availability, stateMachine, paysera)
- ☐ Env vars në Vercel (preview + prod)
- ☐ Callback URL i regjistruar te Paysera prod
- ☐ Migrations aplikuar në prod DB

### Verifikim
- [ ] QA: pagesë reale sandbox → prod, end-to-end

**Notes / decisions Sprint 6:** _(...)_

---

## Decision log (cross-sprint)

> Vendimet arkitekturore që ndikojnë gjithë projektin. Referencë: System Design doc, ADR-1..6.

| # | Vendimi | Sprint | Arsyeja |
|---|---------|--------|---------|
| 1 | Monolit modular, jo mikroservise | 1 | Pa kompleksitet operacional të panevojshëm në këtë shkallë |
| 2 | Konfirmim pagese vetëm via callback s2s | 3 | Browser-i jo i besueshëm; callback-u është |
| 3 | Concurrency te DB (EXCLUDE), jo app lock | 2 | Serverless ekzekuton instanca paralele |
| 4 | Roli te `profiles`, jo JWT claims (MVP) | 1 | Më e thjeshtë; claims më vonë nëse duhet |
| 5 | Soft delete (retire) për makina me histori | 5 | Mbron foreign keys + audit |
| 6 | Email async/non-blocking | 4 | Dështimi i email s'prish pagesën |
| 7 | Heqje e plotë e pagesës; booking auto-`confirmed` | — | Vendim produkti (2026-06-24): pa pagesë online, pa kapar; konfirmim në marrjen e makinës |

---

## Changelog

> Një rresht për çdo seancë pune. Formati: `YYYY-MM-DD — çfarë u bë — sprint`.

- 2026-06-15 — Sprint 1 i mbyllur (setup, schema, auth, RLS, proxy guards); nisi Sprint 2 — sprint 1→2
- 2026-06-15 — Sprint 2 i mbyllur: /cars + /cars/[id] + kalendar overlap (react-day-picker), EXCLUDE constraint + RPC disponueshmërie, POST/GET /api/bookings; typecheck+lint+build OK, overlap testuar në DB lokale — sprint 2
- 2026-06-24 — Hequr krejt logjika e pagesës (Paysera): fshirë lib/paysera, app/api/payments, faqja admin/payments; drop tabela payments + payment_status + confirm_deposit_payment + bookings.deposit_amount + vlera deposit_paid (migration 20260624120000); booking tani auto-`confirmed`, UI/email pa kapar; build+lint OK. Migration ende pa u aplikuar në remote — sprint 3 (dropped)
- 2026-08-31 — Shtuar Fleet Calendar te `/admin/calendar`: timeline horizontal i gjithë flotës me makinat në rreshta, bllloqe rezervimesh + mirëmbajtje/padisponueshmëri, week/month view, filtra (status/kategori/kërkim), Today's Operations, detektim konfliktesh, drawer detajesh (riperdor BookingStatusControl), today line. Migration e re `20260901120000_car_blocks.sql` (tabelë e datuar maintenance/unavailable, RLS admin-only) + logjikë e riperdorshme te `lib/calendar/` (dates, availability engine). typecheck+lint+build OK. ⏸️ Migration ENDE pa u aplikuar në remote hosted DB (kërkon `supabase db push` + rigjenerim `types/database.ts`) — Sprint 5 (partial)
