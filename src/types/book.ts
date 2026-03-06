/**
 * Core type definitions for Tomo.
 *
 * These types represent the flat-file sidecar data model.
 * All syncable state lives in JSON files next to each book.
 */

/** Book metadata parsed from Calibre's metadata.opf or folder structure */
export interface BookMetadata {
  /** Calibre book ID (from folder name) */
  id: number;
  title: string;
  authors: string[];
  /** Title sort key */
  sort?: string;
  /** Author sort key */
  authorSort?: string;
  tags: string[];
  series?: string;
  seriesIndex?: number;
  /** ISO 639 language codes */
  languages: string[];
  publisher?: string;
  /** 0-5 star rating */
  rating?: number;
  /** Publication date (ISO 8601) */
  pubdate?: string;
  /** Date added to library (ISO 8601) */
  timestamp?: string;
  /** Book description (HTML) */
  description?: string;
  /** External identifiers */
  identifiers: Record<string, string>;
  /** Whether cover.jpg exists */
  hasCover: boolean;
  /** Cover image href from OPF (guide reference or manifest item) */
  coverHref?: string;
  /** Relative path within Calibre library */
  path: string;
  /** Available formats (e.g., ["EPUB", "PDF"]) */
  formats: string[];
  /** UUID from Calibre */
  uuid?: string;
}

/**
 * Reading state sidecar — stored as `tomo-reading-state.json` next to each book.
 * This is the primary sync payload.
 */
export interface ReadingState {
  /** Schema version for forward compatibility */
  version: 1;
  /** Which format this state applies to */
  format: string;
  /** EPUB CFI position string */
  cfi?: string;
  /** Fractional position 0.0 - 1.0 */
  progress: number;
  /** Read status */
  status: "unread" | "reading" | "finished";
  /** ISO 8601 timestamp of last position update */
  lastUpdated: string;
  /** Device that last updated this state */
  lastDevice: string;
  /** Total reading time in seconds */
  totalReadingTime: number;
  /** Number of reading sessions */
  sessionsCount: number;
  /** ISO 8601 timestamp of when reading started */
  firstStarted?: string;
}

/** A single highlight/annotation */
export interface Annotation {
  /** Unique ID (UUID v4) */
  id: string;
  /** Annotation type */
  type: "highlight" | "bookmark" | "note";
  /** EPUB CFI start position */
  cfiStart: string;
  /** EPUB CFI end position (for highlights) */
  cfiEnd?: string;
  /** The highlighted text */
  text?: string;
  /** User's note/comment */
  note?: string;
  /** Visual style */
  style?: {
    color: string;
  };
  /** ISO 8601 timestamp */
  created: string;
  /** ISO 8601 timestamp */
  modified: string;
}

/**
 * Annotations sidecar — stored as `tomo-annotations.json` next to each book.
 */
export interface AnnotationsFile {
  /** Schema version for forward compatibility */
  version: 1;
  /** Which format these annotations apply to */
  format: string;
  annotations: Annotation[];
}
