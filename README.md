# Tomo

Cross-platform e-book reader for [Calibre](https://calibre-ebook.com/) libraries with cloud-synced reading state.

## The Problem

No reader app exists that reads EPUBs from a Calibre library folder and syncs reading position, highlights, and notes across devices. Kindle/Kobo solve sync by controlling the entire vertical. Open-source readers are single-device tools. Calibre is a library manager, not a reader.

## The Solution

Tomo reads your Calibre library directly and stores all reading state in a `.tomo/` directory at the library root, keyed by each book's UUID. Any cloud drive (Google Drive, Dropbox, Syncthing, OneDrive) syncs the entire library folder — including `.tomo/` — automatically. No server required.

```
Calibre Library/
├── .tomo/                                          ← Tomo creates this
│   ├── reading-state/
│   │   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.json
│   │   └── f7bac407-648d-4bed-bc86-51a51a0df9fe.json
│   └── annotations/
│       ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.json
│       └── f7bac407-648d-4bed-bc86-51a51a0df9fe.json
├── Author Name/
│   └── Book Title (123)/
│       ├── Book Title.epub
│       ├── metadata.opf              ← Calibre creates this
│       └── cover.jpg                 ← Calibre creates this
└── metadata.db
```

### Why `.tomo/` at Library Root, Not Per-Book Sidecars

The original design placed JSON files inside each book's directory. This is unsafe: when you edit a book's title or author in Calibre, it renames the directory by creating a new one, copying only files it tracks (epub, opf, cover), and deleting the old directory. Any extra files — including Tomo sidecars — are silently destroyed.

The `.tomo/` approach solves this:

- **UUID-keyed** — book identity doesn't change when Calibre renames directories
- **Library root is safe** — Calibre never auto-deletes unknown root-level directories (verified from source: `set_path`, `update_path`, `remove_books`, `move_library_to`, `restore.py`)
- **One folder syncs everything** — `.tomo/` lives inside the Calibre library folder, so existing cloud drive sync covers it
- **Small JSON files** (< 1KB each) sync efficiently with zero conflict risk

### Why Flat Files, Not a Database

Calibre uses SQLite (`metadata.db`), but SQLite + cloud sync = corruption risk. Cloud services sync files, not database transactions. UUID-keyed JSON files are tiny, sync instantly, and have virtually zero conflict risk since you only read on one device at a time.

## Platforms

| Platform    | Technology         | Status      |
| ----------- | ------------------ | ----------- |
| Web (PWA)   | Vite + React       | In progress |
| Desktop     | Tauri (Rust shell) | Planned     |
| Android/iOS | Capacitor          | Planned     |

Same web codebase across all platforms — the [Obsidian model](https://obsidian.md/).

## Current Status

The OPF metadata parser is implemented and tested. Everything else is scaffolded but not yet functional.

| Component       | Status   | Description                                           |
| --------------- | -------- | ----------------------------------------------------- |
| OPF parser      | Done     | Parses all Calibre metadata.opf fields (see below)    |
| Library scanner | Stub     | Will walk Calibre folder structure to discover books  |
| Sidecar R/W     | Stub     | Will read/write `.tomo/` JSON state files             |
| EPUB reader     | Stub     | Will wrap epub.js for rendering and position tracking |
| UI shell        | Scaffold | Vite + React app shell, no routes yet                 |

### OPF Parser

Parses Calibre's `metadata.opf` (Dublin Core + Calibre extensions) using `fast-xml-parser`:

- **Core:** title, authors (with role filtering), description (HTML)
- **Extended:** series, series index, tags, publisher, languages, rating (normalized 0-5), publication date
- **Identifiers:** ISBN, AMAZON, GOODREADS, GOOGLE, MOBI-ASIN, etc. as `Record<string, string>`; UUID extracted separately
- **Cover detection:** `<guide>` reference (preferred) with `<manifest>` item fallback

## Tech Stack

- **TypeScript** (strict mode) + **React 19** + **Vite 6**
- **epub.js** for EPUB rendering and CFI-based position tracking
- **fast-xml-parser** for cross-environment OPF/XML parsing
- **Vitest** for testing
- **ESLint 9** + **Prettier 3** for linting/formatting

## Getting Started

### Docker (recommended)

```bash
docker compose up
```

Opens at `http://localhost:5173`.

### Local (requires Node 22+)

```bash
npm install
npm run dev
```

## Scripts

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `npm run dev`      | Start dev server              |
| `npm run build`    | Type-check + production build |
| `npm run check`    | Type-check only               |
| `npm run test`     | Run tests in watch mode       |
| `npm run test:run` | Run tests once                |
| `npm run lint`     | Lint with ESLint              |
| `npm run format`   | Format with Prettier          |

## Project Structure

```
src/
├── main.tsx                 Entry point
├── App.tsx                  Root component
├── styles/global.css        Global styles (dark theme)
├── types/
│   └── book.ts              Core types: BookMetadata, ReadingState, Annotation
├── lib/
│   ├── calibre/
│   │   ├── parse-opf.ts     Calibre metadata.opf parser ✓
│   │   └── scan-library.ts  Calibre folder structure scanner (stub)
│   ├── reader/
│   │   └── epub-reader.ts   epub.js wrapper (stub)
│   └── sync/
│       ├── reading-state.ts  .tomo/reading-state/<uuid>.json R/W (stub)
│       └── annotations.ts    .tomo/annotations/<uuid>.json R/W (stub)
└── __tests__/               Test files
    └── fixtures/            Test data (sample OPF files, etc.)
```

## State File Formats

### `.tomo/reading-state/<uuid>.json`

```json
{
  "version": 1,
  "format": "EPUB",
  "cfi": "epubcfi(/6/4!/4/2/1:0)",
  "progress": 0.42,
  "status": "reading",
  "lastUpdated": "2026-03-06T12:00:00Z",
  "lastDevice": "linux-desktop",
  "totalReadingTime": 3600,
  "sessionsCount": 5,
  "firstStarted": "2026-03-01T10:00:00Z"
}
```

### `.tomo/annotations/<uuid>.json`

```json
{
  "version": 1,
  "format": "EPUB",
  "annotations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "highlight",
      "cfiStart": "epubcfi(/6/4!/4/2/1:0)",
      "cfiEnd": "epubcfi(/6/4!/4/2/1:50)",
      "text": "The highlighted text content",
      "style": { "color": "#FFEB3B" },
      "created": "2026-03-06T12:00:00Z",
      "modified": "2026-03-06T12:00:00Z"
    }
  ]
}
```

## License

[GPL-3.0](LICENSE) — compatible with Calibre's license.
