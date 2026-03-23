import { describe, expect, it } from "vitest";
import { getWoundTarget } from "../wound";

describe("getWoundTarget", () => {
  it("returns 2+ when strength is at least double toughness", () => {
    expect(getWoundTarget(10, 5)).toBe(2);
  });

  it("returns 3+ when strength is greater than toughness", () => {
    expect(getWoundTarget(5, 4)).toBe(3);
  });

  it("returns 4+ when strength equals toughness", () => {
    expect(getWoundTarget(4, 4)).toBe(4);
  });

  it("returns 5+ when strength is lower than toughness but not half or less", () => {
    expect(getWoundTarget(4, 5)).toBe(5);
  });

  it("returns 6+ when strength is half toughness or less", () => {
    expect(getWoundTarget(3, 6)).toBe(6);
  });
});