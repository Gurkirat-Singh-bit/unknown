# Project Architecture

This project is built to do one main job:

- scrape developer events from public sources
- store them in Cloudflare D1
- show the data in the Next.js frontend through simple API routes

The system is intentionally simple:

- the scraper runs on a schedule
- it writes data once
- the frontend only reads data

---

## High-level flow

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         Developer Event Pipeline                     │
└─────────────────────────────────────────────────────────────────────┘

                      ┌──────────────────────┐
                      │   CRON / Scheduler   │
                      │   runs every 12h     │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │   Hono Worker        │
                      │   apps/api           │
                      │   scraping job       │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────────────┐
         │                       │                               │
         ▼                       ▼                               ▼
┌──────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ Public sources   │   │ Normalizer           │   │ Dedupe / clean data  │
│ - Devpost        │   │ converts all events  │   │ remove duplicates    │
│ - Meetup         │   │ to one format        │   │ unify titles/urls    │
│ - Eventbrite     │   │                      │   │                      │
│ - public event   │   │                      │   │                      │
│   pages          │   │                      │   │                      │
└─────────┬────────┘   └──────────┬───────────┘   └──────────┬───────────┘
          │                       │                               │
          └───────────────────────┴───────────────────────────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │   Cloudflare D1      │
                      │   stores events      │
                      │   id, title, date,   │
                      │   city, url, tags    │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │   Next.js app        │
                      │   apps/web           │
                      │   /api/events        │
                      │   queries D1         │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │   Frontend UI        │
                      │   shows cards/list   │
                      │   filters/search     │
                      │   upcoming events     │
                      └──────────────────────┘
```

---

## Simple explanation

### 1) Scraper worker
The Cloudflare/Hono backend is responsible for scraping event data from public event sources.

It does:

- visit public pages
- collect developer events
- extract titles, dates, locations, links, tags
- clean the data
- remove duplicates
- store into D1

This happens automatically every 12 hours.

### 2) D1 database
D1 is the main storage for all event data.

It saves things like:

- event id
- source name
- title
- description
- date
- city
- country
- online or in-person
- URL
- tags

This means the scraper does the heavy work once, and the app reads from a clean database later.

### 3) Next.js API
The Next app has simple API routes like:

- /api/events
- /api/events?city=London
- /api/events?tag=hackathon

These routes query D1 and return JSON to the frontend.

### 4) Frontend
The frontend is only for display.

It does not scrape anything.
It does not directly manage the database.
It just asks the API for event data and renders it.

---

## Tech stack

```text
Frontend:
  Next.js
  React
  Tailwind / UI components

Backend:
  Hono
  Cloudflare Worker

Data storage:
  Cloudflare D1

Scheduling:
  Cloudflare cron jobs

Scraping sources:
  Devpost
  Meetup
  Eventbrite
  public event pages / community pages
```

---

## In one sentence

The worker scrapes public event sources, stores the cleaned results in D1, and the Next app reads from D1 through its own API so the frontend stays simple and fast.

---

## Project split

```text
apps/
├── api/
│   └── Hono worker
│       - scraping job
│       - cron runner
│       - writes to D1
│
├── web/
│   └── Next.js frontend
│       - calls /api
│       - shows event cards
│       - filters and search
```

This is the basic architecture for the project.
