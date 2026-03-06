/**
 * Parser for Calibre's metadata.opf files.
 *
 * Each book in a Calibre library has a metadata.opf sidecar
 * containing Dublin Core metadata in XML/OPF format.
 * This module parses it into a partial BookMetadata object.
 *
 * Uses fast-xml-parser for cross-environment XML parsing (works in
 * browser, Node, Tauri, Capacitor without DOM shim differences).
 */

import { XMLParser } from "fast-xml-parser";
import type { BookMetadata } from "@/types/book";

/** Fields extracted by parseOpf (core fields for Feature #2) */
export type ParsedOpfCore = Pick<
  BookMetadata,
  "title" | "authors" | "description"
>;

/**
 * fast-xml-parser configuration:
 * - ignoreAttributes: false — we need opf:role, opf:scheme, etc.
 * - attributeNamePrefix: "@_" — standard prefix to distinguish attrs
 * - textNodeName: "#text" — access text content explicitly
 * - isArray — force dc:creator and dc:subject to always be arrays
 *   even when there's only one element (Calibre can have 1..N authors)
 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (_name: string, jpath: string) => {
    return (
      jpath === "package.metadata.dc:creator" ||
      jpath === "package.metadata.dc:subject" ||
      jpath === "package.metadata.dc:identifier" ||
      jpath === "package.metadata.meta"
    );
  },
});

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Parse an OPF XML string and extract core metadata fields.
 *
 * @param xml - Raw XML string from a metadata.opf file
 * @returns Parsed core fields (title, authors, description)
 * @throws {Error} If the XML is not well-formed or has no metadata
 */
export function parseOpf(xml: string): ParsedOpfCore {
  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch (e) {
    throw new Error(
      `Malformed OPF XML: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const pkg = parsed?.package;
  if (!pkg) {
    throw new Error("Invalid OPF: no <package> element found");
  }

  const metadata = pkg.metadata;
  if (!metadata) {
    throw new Error("Invalid OPF: no <metadata> element found");
  }

  // --- Title ---
  const rawTitle = metadata["dc:title"];
  const title = extractText(rawTitle) || "Unknown";

  // --- Authors ---
  const creators: any[] = metadata["dc:creator"] ?? [];
  const authors: string[] = [];
  for (const creator of creators) {
    const role =
      typeof creator === "object" ? creator["@_opf:role"] : undefined;
    // Include if role is "aut" or absent
    if (!role || role === "aut") {
      const name = extractText(creator);
      if (name) {
        authors.push(name);
      }
    }
  }
  if (authors.length === 0) {
    authors.push("Unknown");
  }

  // --- Description ---
  const rawDesc = metadata["dc:description"];
  const description = extractText(rawDesc) || undefined;

  return { title, authors, description };
}

/**
 * Extract text content from a parsed XML node.
 * fast-xml-parser represents text-only elements as strings,
 * but elements with attributes as objects with a #text key.
 */
function extractText(node: unknown): string | undefined {
  if (node == null) return undefined;
  if (typeof node === "string") return node.trim() || undefined;
  if (typeof node === "number") return String(node);
  if (typeof node === "object" && node !== null && "#text" in node) {
    const text = (node as Record<string, unknown>)["#text"];
    if (typeof text === "string") return text.trim() || undefined;
    if (typeof text === "number") return String(text);
  }
  return undefined;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
