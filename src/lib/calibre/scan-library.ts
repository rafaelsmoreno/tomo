/**
 * Calibre library scanner.
 *
 * Walks a Calibre library folder structure:
 *   Library/
 *     Author Name/
 *       Book Title (123)/
 *         metadata.opf
 *         cover.jpg
 *         Book.epub
 *
 * Tomo state lives in .tomo/ at library root (not per-book).
 *
 * Discovers all books, parses metadata.opf, and loads
 * any existing Tomo sidecar files.
 *
 * TODO: Implement directory scanning (via Tauri FS API or File System Access API)
 */

export {};
