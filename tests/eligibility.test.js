/* @flow */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { FUNDING, INTENT } from "@paypal/sdk-constants/src";

import {
  setupButtonWithDefault,
  setupWindowPayPal,
  setupWindowXprops,
} from "./utilities";

describe("eligibility cases", () => {
  const rememberMock = vi.fn().mockResolvedValue();

  beforeEach(() => {
    setupWindowPayPal();

    setupWindowXprops({
      remember: rememberMock,
      intent: INTENT.CAPTURE,
      getPageUrl: () =>
        // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
        Promise.resolve("https://www.merchant.com/foo/bar?baz=1"),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should call xprops.remember with venmo if venmo is eligible", async () => {
    await setupButtonWithDefault({
      merchantID: ["XYZ12345"],
      fundingEligibility: {
        [FUNDING.VENMO]: {
          eligible: true,
          branded: false,
        },
      },
    });

    expect(rememberMock).toHaveBeenCalledWith([FUNDING.VENMO]);
  });
});
