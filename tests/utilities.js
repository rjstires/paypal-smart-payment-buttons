/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable promise/no-native, no-restricted-globals, compat/compat */
/* @flow */
import { FUNDING, COUNTRY } from "@paypal/sdk-constants";

import { setupButton } from "../src";
import { type SetupButtonOptions } from "../src/button/button";
import { MOCK_FIREBASE_CONFIG, MOCK_SDK_META } from "../test/constants";

export const setupButtonWithDefault = async (
  options: $Shape<SetupButtonOptions> = {}
): Promise<void> => {
  await setupButton({
    facilitatorAccessToken: "QQQ123000",
    merchantID: ["XYZ12345"],
    fundingEligibility: {
      [FUNDING.PAYPAL]: {
        eligible: true,
        branded: true,
      },
    },
    personalization: {},
    buyerCountry: COUNTRY.US,
    firebaseConfig: MOCK_FIREBASE_CONFIG,
    eligibility: {
      cardFields: false,
      native: false,
      inlinePaymentFields: {
        inlineEligibleAPMs: [],
        isInlineEnabled: false,
      },
    },
    sdkMeta: MOCK_SDK_META,
    featureFlags: {
      isLsatUpgradable: true,
      shouldThrowIntegrationError: true,
    },
    ...options,
  });
};

type WindowPayPalOptions = $Shape<{|
  postRobot: $Shape<{|
    send: Function,
  |}>,
|}>;

export const setupWindowPayPal = (options: WindowPayPalOptions = {}) => {
  if (window.paypal) {
    delete window.paypal;
  }

  window.paypal = {
    ...options,
  };
};

type WindowXpropsOptions = $Shape<{|
  intent: string,
  getPageUrl: () => Promise<string>,
  remember: () => Promise<void>,
|}>;

export const setupWindowXprops = (options: WindowXpropsOptions = {}) => {
  if (window.xprops) {
    delete window.xprops;
  }

  window.xprops = {
    locale: {
      country: "US",
      lang: "en",
    },
    getPrerenderDetails: () => Promise.resolve({}),
    ...options,
  };
};
