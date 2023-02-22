/* @flow */
/* eslint-disable flowtype/require-exact-type */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import {
  FUNDING,
  CARD,
  type FundingEligibilityType,
} from "@paypal/sdk-constants/src";

import type { ProxyWindow, FeatureFlags } from "../types";
import { getProps, type XProps, type Props } from "../props/props";
import { getSaveActionOnApprove } from "../props/onApprove";
import { getLegacyProps, type LegacyProps } from "../props/legacyProps";
import type {
  XOnApprove,
  XOnComplete,
  XOnCancel,
  XOnError,
  XOnShippingChange,
  XOnShippingAddressChange,
  XOnShippingOptionsChange,
  XCreateOrder,
  XCreateBillingAgreement,
  XCreateSubscription,
  XCreateVaultSetupToken,
  SaveActionOnApprove,
} from "../props";
import { getCreateVaultSetupToken } from "../props/createVaultSetupToken";

import type {
  CardStyle,
  CardPlaceholder,
  CardFieldsState,
  ParsedCardType,
  FieldsState,
} from "./types";
import { CARD_FIELD_TYPE, CARD_ERRORS } from "./constants";

// export something to force webpack to see this as an ES module
export const TYPES = true;

export type PrerenderDetailsType = {|
  win?: ?ProxyWindow,
  fundingSource: $Values<typeof FUNDING>,
  card?: ?$Values<typeof CARD>,
|};

export type CardExport = ({|
  submit: () => ZalgoPromise<void>,
  getState: () => CardFieldsState,
|}) => ZalgoPromise<void>;

export type InputEventState = {|
  potentialCardTypes: $ReadOnlyArray<ParsedCardType>,
  emittedBy: string,
  fields: FieldsState,
  errors: [$Values<typeof CARD_ERRORS>] | [],
  isFormValid: boolean,
|};

export type OnChange = ({|
  ...InputEventState,
|}) => ZalgoPromise<void>;

export type OnBlur = (InputEventState) => ZalgoPromise<void>;

export type OnFocus = (InputEventState) => ZalgoPromise<void>;

export type OnInputSubmitRequest = (InputEventState) => ZalgoPromise<void>;

export type InputEvents = {
  onChange?: OnChange,
  onFocus?: OnFocus,
  onBlur?: OnBlur,
  onInputSubmitRequest?: OnInputSubmitRequest,
};

export type CardXProps = {|
  ...XProps,
  type: $Values<typeof CARD_FIELD_TYPE>,
  style: CardStyle,
  placeholder: CardPlaceholder,
  minLength?: number,
  maxLength?: number,
  cardSessionID: string,
  fundingEligibility: FundingEligibilityType,
  inputEvents: InputEvents,
  export: CardExport,
  parent?: {|
    props: XProps,
    export: CardExport,
  |},
  onApprove: ?XOnApprove,
  onComplete?: ?XOnComplete,
  onCancel: XOnCancel,
  onError: XOnError,
  onShippingChange: ?XOnShippingChange,
  onShippingAddressChange: ?XOnShippingAddressChange,
  onShippingOptionsChange: ?XOnShippingOptionsChange,
  createOrder: ?XCreateOrder,
  createBillingAgreement: ?XCreateBillingAgreement,
  createSubscription: ?XCreateSubscription,
  save?: {|
    createVaultSetupToken?: XCreateVaultSetupToken,
    onApprove?: SaveActionOnApprove
  |},
  hcfSessionID: string
|};

type BaseCardProps = {|
  ...Props,
  type: $Values<typeof CARD_FIELD_TYPE>,
  branded: boolean,
  style: CardStyle,
  placeholder: CardPlaceholder,
  minLength?: number,
  maxLength?: number,
  cardSessionID: string,
  fundingEligibility: FundingEligibilityType,
  export: CardExport,
  inputEvents: InputEvents,
  facilitatorAccessToken: string,
  disableAutocomplete?: boolean,
  hcfSessionID?: string
|};

export type LegacyCardProps = {|
  ...BaseCardProps,
  ...LegacyProps,
|};

export type SaveCardFieldsProps = {|
  ...BaseCardProps,
  userIDToken: string,
  save: {|
    createVaultSetupToken: XCreateVaultSetupToken,
    onApprove: SaveActionOnApprove
  |},
|}

export type CardProps = LegacyCardProps | SaveCardFieldsProps

type GetCardPropsOptions = {|
  facilitatorAccessToken: string,
  featureFlags: FeatureFlags,
|};

/**
 * These CardFields props are disallowed when save is also provided.
 * This is to prevent confusion between which flow is being used at runtime.
 */
const disallowedPropsWithSave = [
  "onApprove",
  "onCancel",
  "onComplete",
  "createOrder",
];
/**
 * When CardFields is used with save, the required properties change. This is for validating the arguments in that use-case.
 */
function validateSaveMethod(xprops, baseProps): {| save: SaveCardFieldsProps['save'], userIDToken: string |} {
  disallowedPropsWithSave.forEach((prop) => {
    if (xprops[prop]) {
      throw new Error(`Do not pass ${prop} with an action.`);
    }
  });

  const save = xprops.save

  if (!save?.createVaultSetupToken) {
      throw new Error("createVaultSetupToken is required when saving card fields");
  }

  if (!save?.onApprove) {
      throw new Error("onApprove is required when saving card fields");
  }

  if (!xprops.userIDToken) {
      throw new Error("data attribute \"data-user-id-token\" is required on SDK script tag for saving card fields");
  }

  return {
    userIDToken: xprops.userIDToken,
    save: {
      createVaultSetupToken: getCreateVaultSetupToken({
        createVaultSetupToken: save.createVaultSetupToken,
      }),
      onApprove: getSaveActionOnApprove({
        // $FlowIssue
        onApprove: save.onApprove,
        onError: baseProps.onError,
      }),
    },
  };
}

export function getCardProps({
  facilitatorAccessToken,
  featureFlags,
}: GetCardPropsOptions): LegacyCardProps | SaveCardFieldsProps {
  const xprops: CardXProps = window.xprops;

  const {
    type,
    cardSessionID,
    style,
    placeholder,
    minLength,
    maxLength,
    fundingEligibility,
    inputEvents,
    branded = fundingEligibility?.card?.branded ?? true,
    parent,
    export: xport,
    save,
    sdkCorrelationID,
    partnerAttributionID,
    hcfSessionID
  } = xprops;

  const returnData = {
    type,
    branded,
    style,
    placeholder,
    minLength,
    maxLength,
    cardSessionID,
    fundingEligibility,
    inputEvents,
    export: parent ? parent.export : xport,
    facilitatorAccessToken,
  };

  const baseProps = getProps({ branded });

  if (save) {
    return {
      ...baseProps,
      ...validateSaveMethod(xprops, baseProps),
      ...returnData,
    };
  } else {
    const props = getLegacyProps({
      paymentSource: null,
      partnerAttributionID: xprops.partnerAttributionID,
      merchantID: xprops.merchantID,
      clientID: xprops.clientID,
      currency: xprops.currency,
      intent: xprops.intent,
      clientAccessToken: xprops.clientAccessToken,
      branded,
      vault: false,
      facilitatorAccessToken,
      featureFlags,
      onShippingChange: xprops.onShippingChange,
      onShippingAddressChange: xprops.onShippingAddressChange,
      onShippingOptionsChange: xprops.onShippingOptionsChange,
      onError: baseProps.onError,
      onCancel: xprops.onCancel,
      onApprove: xprops.onApprove,
      createSubscription: xprops.createSubscription,
      createOrder: xprops.createOrder,
      createBillingAgreement: xprops.createBillingAgreement,
    });

    return {
      ...baseProps,
      ...props,
      type,
      branded,
      style,
      placeholder,
      minLength,
      maxLength,
      cardSessionID,
      fundingEligibility,
      inputEvents,
      export: parent ? parent.export : xport,
      facilitatorAccessToken,
      sdkCorrelationID,
      partnerAttributionID,
      hcfSessionID
    }
  }
}

/* eslint-enable flowtype/require-exact-type */
