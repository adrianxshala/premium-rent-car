# Supabase — RentFlow

Migrations live in `supabase/migrations/` and are applied in filename order.

## When you connect a project (Sprint 1 follow-up)

```bash
# 1. Initialise the Supabase CLI (creates config.toml)
npx supabase init

# 2a. Local dev (Docker)
npx supabase start
npx supabase db reset           # applies every migration to the local DB

# 2b. Or link a hosted project and push
npx supabase link --project-ref <project-ref>
npx supabase db push

# 3. Regenerate types (replaces the hand-written types/database.ts)
npx supabase gen types typescript --local > types/database.ts
# or, against the linked project:
npx supabase gen types typescript --linked > types/database.ts
```

> Until a project is connected, `types/database.ts` is **hand-written** to match
> the migrations. Regenerate it after the first `db push`/`db reset` so it stays
> the source of truth.

## Migration order

| File                          | Contents                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| `20260615120000_profiles.sql` | `user_role` enum, `profiles`, signup trigger, `is_admin()`, RLS |
| `20260615120100_cars.sql`     | `car_status`/`car_category` enums, `cars`, RLS                  |
| `20260615120200_bookings.sql` | `booking_status` enum, `bookings`, RLS                          |
| `20260615120300_payments.sql` | `payment_status` enum, `payments`, RLS                          |

The booking overlap `EXCLUDE` constraint (ADR-3) is intentionally deferred to
Sprint 2.
