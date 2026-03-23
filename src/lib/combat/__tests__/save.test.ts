import { describe, expect, it } from "vitest";
import { applyCoverToSave, getModifiedSave } from "../save";

describe("applyCoverToSave", () => {
  it("does nothing when target is not in cover", () => {
    expect(applyCoverToSave(4, "ranged", false)).toBe(4);
  });

  it("does nothing for melee attacks", () => {
    expect(applyCoverToSave(4, "melee", true)).toBe(4);
  });

  it("improves ranged save by 1", () => {
    expect(applyCoverToSave(4, "ranged", true)).toBe(3);
  });

  it("does not improve beyond 2+", () => {
    expect(applyCoverToSave(2, "ranged", true)).toBe(2);
  });

  it("improves 3+ to 2+", () => {
    expect(applyCoverToSave(3, "ranged", true)).toBe(2);
  });
});

describe("getModifiedSave", () => {
  it("applies AP to armour save", () => {
    expect(getModifiedSave(3, -1, null)).toBe(4);
  });

  it("uses invulnerable save when better", () => {
    expect(getModifiedSave(3, -3, 4)).toBe(4);
  });

  it("uses armour save when better than invulnerable", () => {
    expect(getModifiedSave(2, -1, 4)).toBe(3);
  });
});