# BG Smart Services

A Next.js local-commerce platform for shopping and delivery within Eersterust.

## Included
- Homepage
- Marketplace with Supabase product loading + safe demo fallback
- Local cart using browser storage
- Checkout with R65 delivery and no service fee
- Supabase email/password sign-in and registration
- Account sign-out
- Responsive styling
- Supabase environment-variable support

## Launch rules
- Delivery zone: Eersterust only
- Delivery fee: R65
- Service fee: None

## Run
1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase URL and publishable key
4. `npm run dev`

## Deploy
Upload the project to GitHub and connect the repository to Vercel. Set the same two environment variables in Vercel, then deploy.

## Important
The database schema exists separately in Supabase. Production checkout, payments, notifications, automatic driver dispatch, support, and role-based admin permissions are implemented with Supabase controls.
