/* @flow */
/* eslint import/no-namespace: off */
/* eslint no-empty-function: off */
import { describe, beforeEach, afterEach, test, expect, vi } from "vitest";
import { DEFAULT_INTENT } from "@paypal/sdk-constants/src";

import * as getPropsStuff from "../props/props";
import * as getLegacyPropsStuff from "../props/legacyProps";

import { getCardProps } from "./props";

const saveMock = {
  createVaultSetupToken: vi.fn(),
  onApprove: vi.fn(),
  userIDToken: "token",
};

describe("getCardProps", () => {
  let getPropsSpy;
  let getLegacyPropsSpy;
  const inputs = {
    facilitatorAccessToken: "some-facilitator-access-token",
    featureFlags: {},
  };

  beforeEach(() => {
    window.xprops = {};
    getPropsSpy = vi.spyOn(getPropsStuff, "getProps");
    getLegacyPropsSpy = vi.spyOn(getLegacyPropsStuff, "getLegacyProps");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("uses getProps and legacy props when save is not present", () => {
    window.xprops = { intent: DEFAULT_INTENT };
    getCardProps(inputs);
    expect(getPropsSpy).toBeCalled();
    expect(getLegacyPropsSpy).toBeCalled();
  });

  describe("standalone vault: save", () => {
    test("should throw error without user id token", () => {
      window.xprops.save = {
        createVaultSetupToken: vi.fn(),
        onApprove: vi.fn(),
      };

      expect(() => getCardProps(inputs)).toThrowError(
        'data attribute "data-user-id-token" is required on SDK script tag for saving card fields'
      );
    });

    test("should throw error without create vault setup token", () => {
      window.xprops = {
        userIDToken: "token",
        save: {
          onApprove: vi.fn(),
        },
      };

      expect(() => getCardProps(inputs)).toThrowError(
        "createVaultSetupToken is required when saving card fields"
      );
    });

    test("should throw error without on approve", () => {
      window.xprops = {
        userIDToken: "token",
        save: {
          createVaultSetupToken: vi.fn(),
        },
      };

      expect(() => getCardProps(inputs)).toThrowError(
        "onApprove is required when saving card fields"
      );
    });

    test.each([
      ["onApprove", () => {}, "Do not pass onApprove with an action."],
      ["onCancel", () => {}, "Do not pass onCancel with an action."],
      ["createOrder", () => {}, "Do not pass createOrder with an action."],
    ])("errors when %s and an action are provided", (prop, propValue) => {
      window.xprops = {
        save: saveMock,
        [prop]: propValue,
      };

      expect(() => getCardProps(inputs)).toThrow(
        `Do not pass ${prop} with an action.`
      );
    });

    test("should return props with all required methods", () => {
      window.xprops = {
        userIDToken: "token",
        save: saveMock,
      };

      expect(getCardProps(inputs)).toEqual(
        expect.objectContaining({
          userIDToken: "token",
          save: {
            createVaultSetupToken: expect.any(Function),
            onApprove: expect.any(Function),
          },
        })
      );
    });
  });
});
