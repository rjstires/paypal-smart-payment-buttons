/* @flow */
/* eslint max-nested-callbacks: off, max-lines: off */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { setupNativeFallback } from "../src/native/fallback";

import { setupWindowPayPal, setupWindowXprops } from "./utilities";

describe("Native fallback cases", () => {
  const postRobotSend = vi.fn().mockResolvedValue({
    source: window,
    origin: window.location.origin,
    data: null,
  });

  const windowOpener = {};
  let nativeFallback;

  beforeEach(() => {
    setupWindowPayPal({
      postRobot: {
        send: postRobotSend,
      },
    });

    setupWindowXprops();
    window.opener = windowOpener;
  });

  afterEach(() => {
    delete window.opener;
    nativeFallback?.destroy();
    vi.resetAllMocks();
  });

  it("should open the native fallback and send a detect web switch message", async () => {
    const parentDomain = "foo.paypal.com";

    nativeFallback = await setupNativeFallback({ parentDomain });

    expect(postRobotSend).toHaveBeenCalledWith(
      windowOpener,
      "detectWebSwitch",
      expect.any(Object),
      { domain: parentDomain }
    );
  });
});
