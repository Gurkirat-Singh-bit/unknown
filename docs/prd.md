# Product Requirements Document (PRD)

## 1. Product name
Global Developer Event Finder

## 2. Product summary
A web app that helps developers discover hackathons, meetups, and tech events happening around the world.

The product collects event data from public sources, stores it in Cloudflare D1, and serves it through a Next.js app so users can discover relevant events based on location, date, and category.

---

## 3. Problem statement
Developers often miss good events because event information is spread across many websites and platforms.

People have to check multiple sources to find:
- hackathons
- developer meetups
- online events
- local technology gatherings
- startup and AI events

There is currently no simple place where a person can see all relevant events in one view.

---

## 4. Product goal
The goal of the product is to create a simple global event discovery platform for developers and tech communities.

Users should be able to:
- find upcoming hackathons
- discover nearby meetups
- browse online events
- filter by city or country
- find events by interest or category
- see fresh event data without manual updates

---

## 5. Target users
- developers
- student builders
- startup founders
- hackathon participants
- tech community members
- people looking for local or remote events

---

## 6. Core user needs
- easy access to event information
- quick filtering by location
- event discovery without checking many websites
- fresh data updated regularly
- simple event cards with title, date, location, and link

---

## 7. Product scope
### In scope
- scraping public developer event sources
- standardizing the event data
- removing duplicates
- storing data in D1
- refreshing data every 12 hours
- filtering by city, online/in-person, and date
- displaying event listings in the frontend

### Out of scope
- user logins and accounts
- event creation by users
- ticket purchasing
- direct payment flows
- custom social features

---

## 8. Functional requirements

### 8.1 Event scraping
The backend must scrape event data from public sources such as:
- Devpost
- Meetup
- Eventbrite
- other public event/community pages

### 8.2 Data normalization
Each event must be converted into a standard format before saving.

Required fields:
- title
- description
- source
- date/time
- location or city
- country
- online or in-person flag
- organizer
- URL
- tags

### 8.3 Deduplication
The system must avoid duplicate events that appear across multiple sources.

### 8.4 Data refresh
The scraper runs every 12 hours and updates the database with fresh event information.

### 8.5 Expired event handling
Old events should be removed or hidden from active results so users only see relevant upcoming events.

### 8.6 Querying
The Next.js app must provide API routes to query event data from D1.

Examples:
- /api/events
- /api/events?city=London
- /api/events?online=true
- /api/events?tag=hackathon

### 8.7 Frontend display
The frontend should display event cards with:
- event name
- date
- time
- location
- organizer
- source
- event link

---

## 9. Non-functional requirements
- data should refresh automatically every 12 hours
- scraped data should be cleaned and normalized
- API responses should be fast
- system should avoid duplicate entries
- database should be reliable and easy to query
- the frontend should be simple and readable

---

## 10. Architecture overview

```text
Public event sources
        ↓
Scraper worker (Hono / Cloudflare)
        ↓
Normalize + dedupe data
        ↓
Cloudflare D1 database
        ↓
Next.js API routes
        ↓
Frontend UI
```

The scraper writes to D1.
The Next app reads from D1 through its own API.
The browser never directly scrapes or manages the database.

---

## 11. Business logic
The platform should work as a global event discovery feed for developers.

The business logic is:
- gather public event data
- keep it up to date
- filter by user location and event type
- show relevant events to the user
- reduce the time it takes to find tech events

---

## 12. Success metrics
- users can find relevant events quickly
- event data stays current
- event listings are not duplicated
- outdated events are removed from active results
- the refresh cycle works reliably every 12 hours

---

## 13. Future enhancements
- user preferences for favorite tags
- email alerts for nearby events
- city-based recommendations
- saved events
- event RSS or feed export
- AI-based event categorization

---

## 14. Final product vision
A one-stop platform where developers can discover hackathons, meetups, and tech events happening around the globe, without manually searching multiple websites.

The system will automatically refresh and filter the data so users always get relevant, current event information.
