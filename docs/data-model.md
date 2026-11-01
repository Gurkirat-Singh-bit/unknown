# Initial D1 Event Data Model

This proposal translates the database canvas sketch into an initial relational record. It is not yet implemented as a migration.

| Column | Type | Purpose |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Stable internal event record ID. |
| `title` | `TEXT NOT NULL` | Event name. |
| `type` | `TEXT` | Event category, such as hackathon or meetup. |
| `location` | `TEXT` | Venue, city, or online location. |
| `starts_at` | `TEXT` | Actual event start in ISO 8601 form, including timezone when known. |
| `ends_at` | `TEXT` | Actual event end in ISO 8601 form, when available. |
| `description` | `TEXT` | Event details from the source. |
| `image_url` | `TEXT` | Source image URL or URL of an image stored in R2. |
| `platform` | `TEXT NOT NULL` | Source platform, e.g. `devpost`. |
| `source_url` | `TEXT NOT NULL` | Canonical event listing URL. |
| `scraped_at` | `TEXT NOT NULL` | Last successful scrape time in ISO 8601 form. |
| `created_at` | `TEXT NOT NULL` | Row creation time. |
| `updated_at` | `TEXT NOT NULL` | Last time normalized event data changed. |

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  location TEXT,
  starts_at TEXT,
  ends_at TEXT,
  description TEXT,
  image_url TEXT,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  scraped_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (platform, source_url)
);

CREATE INDEX events_starts_at_idx ON events (starts_at);
CREATE INDEX events_type_idx ON events (type);
```

## Notes

- `scraped_at` captures when data was collected; `starts_at` and `ends_at` describe the real event time.
- The canvas calls the event name `Name`; this model uses `title`.
- The `(platform, source_url)` uniqueness constraint supports idempotent repeated scrapes.
- Structured city/country, online status, tags, organizer, and prizes can be added once the first source parser confirms what it can reliably provide.
- Cross-platform event merging is separate from source-level deduplication.
