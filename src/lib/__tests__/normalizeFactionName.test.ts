import { describe, expect, it } from "vitest";
import { normalizeFactionName } from "../normalizeFactionName";

describe("normalizeFactionName", () => {
  it("normalizes Tau aliases to the canonical faction name", () => {
    expect(normalizeFactionName("Tau Empire")).toBe("T'au Empire");
    expect(normalizeFactionName("T’au Empire")).toBe("T'au Empire");
    expect(normalizeFactionName("Tâ€™au Empire")).toBe("T'au Empire");
  });

  it("normalizes mojibake apostrophes for other factions too", () => {
    expect(normalizeFactionName("Emperorâ€™s Children")).toBe("Emperor's Children");
    expect(normalizeFactionName("Emperor’s Children")).toBe("Emperor's Children");
  });
});
