import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { parseOpf } from "@/lib/calibre/parse-opf";

const FIXTURES_DIR = resolve(__dirname, "fixtures");

function readFixture(name: string): string {
  return readFileSync(resolve(FIXTURES_DIR, name), "utf-8");
}

describe("parseOpf — core fields", () => {
  describe("title", () => {
    it("extracts title from metadata-full.opf", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.title).toBe("The Way of Kings");
    });

    it("extracts title from metadata-minimal.opf", () => {
      const result = parseOpf(readFixture("metadata-minimal.opf"));
      expect(result.title).toBe(
        "THE INTELLECTUAL LIFE, Its Spirit, Conditions, Methods - Sertillanges",
      );
    });

    it("extracts title from metadata-multi-author.opf", () => {
      const result = parseOpf(readFixture("metadata-multi-author.opf"));
      expect(result.title).toBe(
        "Good Omens: The Nice and Accurate Prophecies of Agnes Nutter, Witch",
      );
    });

    it('defaults to "Unknown" when title is missing', () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
          </metadata>
        </package>`;
      const result = parseOpf(xml);
      expect(result.title).toBe("Unknown");
    });
  });

  describe("authors", () => {
    it("extracts single author", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.authors).toEqual(["Brandon Sanderson"]);
    });

    it("extracts multiple authors in order", () => {
      const result = parseOpf(readFixture("metadata-multi-author.opf"));
      expect(result.authors).toEqual(["Neil Gaiman", "Terry Pratchett"]);
    });

    it('defaults to ["Unknown"] when no creator elements', () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
            <dc:title>Test</dc:title>
          </metadata>
        </package>`;
      const result = parseOpf(xml);
      expect(result.authors).toEqual(["Unknown"]);
    });

    it("skips creators with non-author roles", () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
            <dc:title>Test</dc:title>
            <dc:creator opf:role="aut">Real Author</dc:creator>
            <dc:creator opf:role="edt">Some Editor</dc:creator>
            <dc:creator opf:role="ill">Some Illustrator</dc:creator>
          </metadata>
        </package>`;
      const result = parseOpf(xml);
      expect(result.authors).toEqual(["Real Author"]);
    });

    it("includes creators with no role attribute (treated as author)", () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
            <dc:title>Test</dc:title>
            <dc:creator>No Role Author</dc:creator>
          </metadata>
        </package>`;
      const result = parseOpf(xml);
      expect(result.authors).toEqual(["No Role Author"]);
    });
  });

  describe("description", () => {
    it("extracts HTML description from metadata-full.opf", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.description).toBeDefined();
      expect(result.description).toContain("Roshar is a world of stone");
      expect(result.description).toContain("Knights Radiant");
    });

    it("extracts HTML description from metadata-multi-author.opf", () => {
      const result = parseOpf(readFixture("metadata-multi-author.opf"));
      expect(result.description).toBeDefined();
      expect(result.description).toContain("The world will end on Saturday");
    });

    it("returns undefined when no description", () => {
      const result = parseOpf(readFixture("metadata-empty.opf"));
      expect(result.description).toBeUndefined();
    });

    it("returns undefined when no description in minimal", () => {
      const result = parseOpf(readFixture("metadata-minimal.opf"));
      expect(result.description).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("throws on malformed XML", () => {
      expect(() => parseOpf("<not valid xml>>>>")).toThrow("Invalid OPF");
    });

    it("throws when no metadata element exists", () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
        </package>`;
      expect(() => parseOpf(xml)).toThrow("no <metadata> element found");
    });
  });
});
