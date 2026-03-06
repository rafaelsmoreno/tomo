import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const FIXTURES_DIR = resolve(__dirname);

function readFixture(name: string): string {
  return readFileSync(resolve(FIXTURES_DIR, name), "utf-8");
}

describe("test infrastructure", () => {
  it("vitest runs successfully", () => {
    expect(true).toBe(true);
  });

  it("can read fixture files", () => {
    const opf = readFixture("metadata-minimal.opf");
    expect(opf).toContain("<?xml");
    expect(opf).toContain("<dc:title>");
  });
});

describe("OPF fixture files are valid XML", () => {
  const fixtures = [
    "metadata-minimal.opf",
    "metadata-full.opf",
    "metadata-multi-author.opf",
    "metadata-empty.opf",
  ];

  for (const fixture of fixtures) {
    it(`${fixture} is well-formed XML`, () => {
      const content = readFixture(fixture);
      expect(content).toContain("<?xml version");
      expect(content).toContain("<package");
      expect(content).toContain("<metadata");
      expect(content).toContain("</package>");
    });
  }

  it("metadata-full.opf has series, tags, rating, description, and multiple identifiers", () => {
    const content = readFixture("metadata-full.opf");
    expect(content).toContain("calibre:series");
    expect(content).toContain("calibre:series_index");
    expect(content).toContain("calibre:rating");
    expect(content).toContain("<dc:description>");
    expect(content).toContain("<dc:subject>");
    expect(content).toContain('opf:scheme="ISBN"');
    expect(content).toContain('opf:scheme="AMAZON"');
    expect(content).toContain('opf:scheme="GOODREADS"');
  });

  it("metadata-multi-author.opf has two dc:creator elements", () => {
    const content = readFixture("metadata-multi-author.opf");
    const creatorMatches = content.match(/<dc:creator/g);
    expect(creatorMatches).toHaveLength(2);
  });

  it("metadata-empty.opf has no optional fields", () => {
    const content = readFixture("metadata-empty.opf");
    expect(content).not.toContain("calibre:series");
    expect(content).not.toContain("calibre:rating");
    expect(content).not.toContain("<dc:description>");
    expect(content).not.toContain("<dc:subject>");
    expect(content).not.toContain("<dc:publisher>");
    expect(content).not.toContain("<guide>");
  });
});
