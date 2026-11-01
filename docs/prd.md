# Unknown — Product Requirements

## Summary

Unknown is a platform for discovering hackathons and online developer events from public platforms, starting with Devpost. It collects event information in one place so people can find events that fit their interests, location, and schedule.

## Problem and users

Event details are scattered across many websites. Developers, student builders, and hackathon participants have to search each platform separately and can miss events they would want to attend.

## Goals

- Collect public hackathon and event listings, initially from Devpost.
- Normalize event details into a consistent D1 record.
- Keep records refreshed and link each event to its source.
- Let the Next.js frontend read event data from D1 server-side and provide useful filters.

## Initial scope

- A Hono Cloudflare Worker for scraping and writing event data.
- Cloudflare D1 for structured event records.
- Next.js for the frontend; the intended design queries D1 server-side without a separate read API.
- A scheduled scrape every six hours, as specified in the latest project notes.
- Cloudflare R2 for copied event thumbnails; D1 retains their public image URLs.

Accounts, social features, user-submitted events, ticket sales, and payment flows are outside the first version. Saved events, alerts, recommendations, and additional sources are possible later additions.

## Event information

The initial record should cover a stable ID, title/name, event type, location, actual event date and time, description, image URL, source platform, canonical source URL, and scrape timestamp. See [data-model.md](data-model.md) for the proposed D1 schema.

## Core requirements

1. Fetch public event listings from supported sources, beginning with Devpost.
2. Parse and normalize available fields into the shared event model.
3. Upsert records so repeated scrapes do not create duplicates.
4. Track when each record was last successfully scraped.
5. Exclude expired events from active listings, with expiry behavior to be implemented.
6. Render event cards with title, date, location, source, and link.
7. Support useful filters such as event type, date, and location as the data allows.

## Success criteria

- Users can browse listings gathered from supported sources in one place.
- Event records link to the original listing and are refreshed on schedule.
- Repeat scrapes update records without creating duplicates.
- The frontend can show and filter upcoming events from D1.

## Current status

This document describes the intended product. The scraper now collects open and upcoming Devpost listings through paginated JSON requests and validates a minimal shared source schema. It normalizes to a shared event model and calls Drizzle upserts from its scheduled handler. Actual D1 configuration, migration application, and deployment remain pending. See [architecture.md](architecture.md) and [implementation-status.md](implementation-status.md).
