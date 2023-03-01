/* @flow */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { INTENT } from "@paypal/sdk-constants";

import {
  hasCardFields,
  submitCardFields,
} from "../../../src/card/interface";
import { getCardProps } from "../../../src/card/props";
import { resetGQLErrors } from "../../../src/card/interface/gql";
import { savePaymentSource } from "../../../src/card/interface/vault-without-purchase";
import { confirmOrderAPI } from "../../../src/api";

vi.mock("../../../src/card/props", () => {
  return {
    getCardProps: vi.fn(() => ({})),
  };
});

vi.mock("../../../src/card/interface/hasCardFields", () => {
  return {
    hasCardFields: vi.fn(() => true),
  };
});

const mockGetCardFieldsReturn = {
  name: "John Doe",
  number: "4111111111111111",
  cvv: "123",
  expiry: "01/24",
  postalCode: "91210",
};

vi.mock("../../../src/card/interface/getCardFields", () => {
  return {
    getCardFields: vi.fn(() => mockGetCardFieldsReturn),
  };
});

vi.mock("../../../src/card/interface/gql", () => ({
  resetGQLErrors: vi.fn(),
}));

vi.mock("../../../src/card/interface/vault-without-purchase", () => ({
  savePaymentSource: vi.fn(),
}));

vi.mock("../../../src/lib")
vi.mock("../../../src/api", () => ({
    // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
  confirmOrderAPI: vi.fn(() => Promise.resolve({ id: "test-order-id" })),
}));

describe("submitCardFields", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const defaultOptions = {
    facilitatorAccessToken: "test-access-token",
    featureFlags: {},
  };

  test("should throw an error if we do not have card fields", () => {
    // $FlowIssue
    hasCardFields.mockReturnValue(false);

    expect.assertions(1);

    expect(submitCardFields(defaultOptions)).rejects.toThrowError(
      "Card fields not available to submit"
    );
  });

  test("should use the provided save action", async () => {
    const createVaultSetupToken = vi.fn().mockResolvedValue('setup-token');
    const onApprove = vi.fn();

    const mockGetCardPropsReturn = {
      userIDToken: 'token',
      clientID: 'client-id',
      save: {
        onApprove,
        createVaultSetupToken,
      },
    };
    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);

    await submitCardFields(defaultOptions);

    expect.assertions(2);
    expect(resetGQLErrors).toHaveBeenCalledOnce();
    expect(savePaymentSource).toHaveBeenCalledWith({
      save: mockGetCardPropsReturn.save,
      userIDToken: mockGetCardPropsReturn.userIDToken,
      clientID: mockGetCardPropsReturn.clientID,
      facilitatorAccessToken: defaultOptions.facilitatorAccessToken,
      paymentSource: {
        card: {
          billingAddress: {
            postalCode: "91210",
          },
          expiry: "2024-01",
          name: "John Doe",
          number: "4111111111111111",
          securityCode: "123",
        },
      },
    });
  });

  test("should checkout", async () => {
    const mockGetCardPropsReturn = {
      createOrder: vi.fn().mockResolvedValue("test-order-id"),
      onApprove: vi.fn(),
    };

    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);

    expect.assertions(3);
    await submitCardFields(defaultOptions);
    expect(mockGetCardPropsReturn.createOrder).toHaveBeenCalled();
    expect(confirmOrderAPI).toHaveBeenCalledWith(
      "test-order-id",
      {
        payment_source: {
          card: {
            expiry: "2024-01",
            billing_address: {
              postal_code: "91210",
            },
            name: "John Doe",
            number: "4111111111111111",
            security_code: "123",
          },
        },
      },
      {
        facilitatorAccessToken: "test-access-token",
        partnerAttributionID: "",
      }
    );
    expect(mockGetCardPropsReturn.onApprove).toHaveBeenCalledWith(
      {
        payerID: expect.any(String),
        buyerAccessToken: expect.any(String),
        id: "test-order-id",
      },
      {
        restart: expect.any(Function),
      }
    );
  });

  test("should catch any errors from confirmOrderAPI", () => {
    // $FlowIssue
    confirmOrderAPI.mockImplementationOnce(() => {
      throw new Error("confirm order api failure test");
    });
    const mockGetCardPropsReturn = {
      intent: INTENT.CAPTURE,
      createOrder: vi.fn().mockResolvedValue("test-order-id"),
      onApprove: vi.fn(),
    };

    // $FlowIssue
    getCardProps.mockReturnValueOnce(mockGetCardPropsReturn);

    expect.assertions(1);
    expect(submitCardFields(defaultOptions)).rejects.toThrow(
      "confirm order api failure test"
    );
  });
});
