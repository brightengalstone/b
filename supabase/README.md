# Supabase setup

The BG Smart Services database schema is already created in the Supabase project. This app expects:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Do not put a Supabase service-role/secret key in the browser or in `NEXT_PUBLIC_` variables.

Before production checkout, add secure server-side/RPC authorization for order creation and role-based dashboards. The current app keeps demo products for a safe preview until live products are present.
