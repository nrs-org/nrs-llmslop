# NRS Media Ranking System — Web App Specification

## Overview

This project is a web application for managing and ranking **entries**.  
An *entry* is a general concept that can represent any type of media (anime, manga,
light novels, music, etc.) or even non-media entities (e.g. people).  

The app supports:

- Storing entries with metadata (title, progress, etc.)
- Relationships between entries (e.g. "singer of song", "adaptation of LN → anime")
- Querying, filtering, and sorting entries
- Automated data enrichment from external sources (YouTube descriptions, VGMdb
album notes, MyAnimeList API, etc.)
- Automatic scoring calculations
- Read-only public access, with admin-only modification

---

## Tech Stack

### Backend

- **Database**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Testing (unit)**: Vitest
- **Testing (e2e)**: Playwright (later phase)
- **LLM Integration**: Gemini API (relation extraction, metadata parsing)

### Frontend

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Bundler**: Turbopack (default with Next.js)

### Tooling

- **Package manager**: Bun
- **Auth**: BetterAuth
- **Deployment**:
  - Frontend → Vercel
  - Backend/DB → Railway or Render (Postgres)
