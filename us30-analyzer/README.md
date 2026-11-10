# US30 Analyzer

A standalone, mobile-first US30 analysis workspace. This first scaffold is intentionally isolated in its own directory and does not change the BG Smart Services application.

## Current scope
- Responsive phone-first dashboard and installable PWA shell.
- Timeframe selector: M1, M5, M15, H1 and H4.
- Candlestick-style illustrative chart, explicitly labelled as demo data.
- Analysis, trade-planning and monitor UI states.
- No broker connection, no order execution and no fabricated live quotes/signals.

## Before live analysis
US30 CFD symbols and prices differ by broker. Choose the exact data source/broker feed before enabling live calculations. Configure a server-side adapter with credentials stored only in environment variables; never expose API keys in browser code. Validate timestamps, market sessions, missing candles, rate limits and symbol mapping. Monitoring and push alerts require a server-side scheduler/worker and notification permission.

## Run locally
Serve this directory with any static HTTP server, or configure Vercel with this directory as the project root. The app is plain HTML/CSS/JS and has no build step.

## Safety
Demo candles are synthetic. Do not use them for trading. The analyzer is informational and does not provide guaranteed outcomes or execute trades.
