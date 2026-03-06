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

  describe("series", () => {
    it("extracts series name and index from metadata-full.opf", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.series).toBe("The Stormlight Archive");
      expect(result.seriesIndex).toBe(1);
    });

    it("returns undefined when no series metadata", () => {
      const result = parseOpf(readFixture("metadata-minimal.opf"));
      expect(result.series).toBeUndefined();
      expect(result.seriesIndex).toBeUndefined();
    });
  });

  describe("tags", () => {
    it("extracts all tags from metadata-full.opf", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.tags).toEqual([
        "Fantasy",
        "Epic Fantasy",
        "Fiction",
        "High Fantasy",
      ]);
    });

    it("extracts tags from metadata-multi-author.opf", () => {
      const result = parseOpf(readFixture("metadata-multi-author.opf"));
      expect(result.tags).toEqual(["Fantasy", "Humor", "Fiction"]);
    });

    it("returns empty array when no tags", () => {
      const result = parseOpf(readFixture("metadata-minimal.opf"));
      expect(result.tags).toEqual([]);
    });
  });

  describe("publisher", () => {
    it("extracts publisher from metadata-full.opf", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.publisher).toBe("Tor Books");
    });

    it("extracts publisher from metadata-minimal.opf", () => {
      const result = parseOpf(readFixture("metadata-minimal.opf"));
      expect(result.publisher).toBe("Lebooks Editora");
    });

    it("returns undefined when no publisher", () => {
      const result = parseOpf(readFixture("metadata-empty.opf"));
      expect(result.publisher).toBeUndefined();
    });
  });

  describe("languages", () => {
    it("extracts language from metadata-full.opf", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.languages).toEqual(["eng"]);
    });

    it("returns language even for undetermined ('und')", () => {
      const result = parseOpf(readFixture("metadata-empty.opf"));
      expect(result.languages).toEqual(["und"]);
    });

    it("returns empty array when no language element", () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
            <dc:title>Test</dc:title>
          </metadata>
        </package>`;
      const result = parseOpf(xml);
      expect(result.languages).toEqual([]);
    });

    it("handles multiple languages", () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
            <dc:title>Bilingual Book</dc:title>
            <dc:language>eng</dc:language>
            <dc:language>spa</dc:language>
          </metadata>
        </package>`;
      const result = parseOpf(xml);
      expect(result.languages).toEqual(["eng", "spa"]);
    });
  });

  describe("rating", () => {
    it("extracts and normalizes rating from metadata-full.opf (10→5)", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.rating).toBe(5);
    });

    it("extracts and normalizes rating from metadata-multi-author.opf (8→4)", () => {
      const result = parseOpf(readFixture("metadata-multi-author.opf"));
      expect(result.rating).toBe(4);
    });

    it("returns undefined when no rating", () => {
      const result = parseOpf(readFixture("metadata-minimal.opf"));
      expect(result.rating).toBeUndefined();
    });
  });

  describe("pubdate", () => {
    it("extracts pubdate from metadata-full.opf", () => {
      const result = parseOpf(readFixture("metadata-full.opf"));
      expect(result.pubdate).toBe("2010-08-31T00:00:00+00:00");
    });

    it("extracts pubdate from metadata-multi-author.opf", () => {
      const result = parseOpf(readFixture("metadata-multi-author.opf"));
      expect(result.pubdate).toBe("1990-05-10T00:00:00+00:00");
    });

    it("returns undefined when no date element", () => {
      const result = parseOpf(readFixture("metadata-empty.opf"));
      expect(result.pubdate).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("throws 'no <package>' when XML has no package element", () => {
      // fast-xml-parser is lenient — it parses invalid XML into nonsense
      // rather than throwing. The structural checks catch the result.
      expect(() => parseOpf("<not valid xml>>>>")).toThrow(
        "no <package> element found",
      );
    });

    it("throws 'Malformed OPF XML' when input is not parseable", () => {
      // fast-xml-parser throws on non-string input (null/undefined);
      // this exercises the catch block wrapping parser errors.
      expect(() => parseOpf(null as unknown as string)).toThrow(
        "Malformed OPF XML",
      );
    });

    it("throws when no metadata element exists", () => {
      const xml = `<?xml version='1.0' encoding='utf-8'?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0">
        </package>`;
      expect(() => parseOpf(xml)).toThrow("no <metadata> element found");
    });
  });
});
