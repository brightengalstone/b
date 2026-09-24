# BG Smart Services — V1.1 foundation

A Next.js starter upgraded for the BG Smart Services Eersterust local-commerce platform.

## Included
- Homepage
- Marketplace with Supabase product loading + safe demo fallback
- Local cart using browser storage
- Checkout foundation with R60 delivery + R45 service fees
- Supabase email/password sign-in and registration
- Account sign-out
- Admin, merchant, driver and tracking route foundations
- Responsive styling
- Supabase environment-variable support

## Launch rules
- Delivery zone: Eersterust only
- Delivery fee: R60
- Service fee: R45

## Run
1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase URL and publishable key
4. `npm run dev`

## Deploy
Upload the project to GitHub and connect the repository to Vercel. Set the same two environment variables in Vercel, then deploy.

## Important
The database schema exists separately in Supabase. Production checkout and role-based admin/merchant/driver permissions should be hardened server-side before accepting real orders or payments.
