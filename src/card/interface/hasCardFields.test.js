/* @flow */
import { describe, it, expect, vi } from "vitest";

// TODO: not tested in getCardFrames.test.js
import { getCardFrames } from "./getCardFrames";

import { hasCardFields } from ".";

vi.mock("../../../src/card/interface/getCardFrames", () => ({
  getCardFrames: vi.fn(() => ({
    cardFrame: {},
  })),
}));

describe("card/interface/hasCardFields", () => {
  it("returns true if we have cardFrame", () => {
    expect(hasCardFields()).toBe(true);
  });

  it("returns true if we have number, cvv and expiry", () => {
    // $FlowIssue
    getCardFrames.mockReturnValueOnce({
      cardNumberFrame: {},
      cardCVVFrame: {},
      cardExpiryFrame: {},
    });

    expect(hasCardFields()).toBe(true);
  });

  it("returns false when there is no card frame", () => {
    // $FlowIssue
    getCardFrames.mockReturnValueOnce({});

    expect(hasCardFields()).toBe(false);
  });
});
