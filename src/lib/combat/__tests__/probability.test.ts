import { describe, expect, it } from "vitest";
import { getSuccessChance, parseDiceValue } from "../probability";

describe("getSuccessChance", () => {
  it("returns correct chance for 2+", () => {
    expect(getSuccessChance(2)).toBe(5 / 6);
  });

  it("returns correct chance for 3+", () => {
    expect(getSuccessChance(3)).toBe(4 / 6);
  });

  it("returns correct chance for 4+", () => {
    expect(getSuccessChance(4)).toBe(3 / 6);
  });

  it("returns correct chance for 5+", () => {
    expect(getSuccessChance(5)).toBe(2 / 6);
  });

  it("returns correct chance for 6+", () => {
    expect(getSuccessChance(6)).toBe(1 / 6);
  });

  it("returns 0 for null", () => {
    expect(getSuccessChance(null)).toBe(0);
  });

  it("caps impossible values above 6 to 0", () => {
    expect(getSuccessChance(7)).toBe(0);
  });
});

describe("parseDiceValue", () => {
  it("returns numeric values unchanged", () => {
    expect(parseDiceValue(3)).toBe(3);
  });

  it("parses D6 as average 3.5", () => {
    expect(parseDiceValue("D6")).toBe(3.5);
  });

  it("parses 2D6 as average 7", () => {
    expect(parseDiceValue("2D6")).toBe(7);
  });

  it("parses D6+2", () => {
    expect(parseDiceValue("D6+2")).toBe(5.5);
  });

  it("parses 2D6+1", () => {
    expect(parseDiceValue("2D6+1")).toBe(8);
  });

  it("parses lowercase and spaces", () => {
    expect(parseDiceValue(" 2d6 +1 ")).toBe(8);
  });

  it("returns 0 for invalid string", () => {
    expect(parseDiceValue("abc")).toBe(0);
  });
});