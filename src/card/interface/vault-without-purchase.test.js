/* @flow */
import { describe, afterEach, vi, test, expect, beforeEach } from "vitest";

import { getVaultSetupToken, updateVaultSetupToken } from "../../api/vault";
import {
  vaultWithoutPurchaseSuccess,
  vaultWithoutPurchaseFailure,
} from "../logger";
import type { SaveCardFieldsProps } from "../props";

import { savePaymentSource } from "./vault-without-purchase";

vi.mock("../logger");

vi.mock("../../../src/api/vault");

describe("savePaymentSource", () => {
  beforeEach(() => {
    // $FlowIssue
    getVaultSetupToken.mockResolvedValue();
    // $FlowIssue
    updateVaultSetupToken.mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultVaultSetupToken = "vault-setup-token";

  // $FlowIssue
  const defaultSave = (options = {}): SaveCardFieldsProps["save"] => ({
    createVaultSetupToken: vi.fn().mockResolvedValue(defaultVaultSetupToken),
    onApprove: vi.fn(),
    ...options,
  });

  const defaultOptions = {
    save: defaultSave(),
    clientID: "client-id",
    facilitatorAccessToken: "low-scoped-access-token",
    paymentSource: {
      card: {
        expiry: "01/24",
        name: "John Doe",
        number: "4111111111111111",
        securityCode: "123",
      },
    },
    onError: vi.fn(),
  };

  test("should handle failure from merchant-supplied createVaultSetupToken", async () => {
    const createVaultSetupTokenError = new Error(
      "error with create vault setup token"
    );
    const rejectCreateVaultSetupToken = vi
      .fn()
      .mockRejectedValue(createVaultSetupTokenError);

    await savePaymentSource({
      ...defaultOptions,
      save: defaultSave({ createVaultSetupToken: rejectCreateVaultSetupToken }),
    });

    expect.assertions(3);
    expect(vaultWithoutPurchaseSuccess).not.toHaveBeenCalled();
    expect(vaultWithoutPurchaseFailure).toHaveBeenCalledWith({
      error: createVaultSetupTokenError,
    });
    expect(defaultOptions.onError).toBeCalledWith(createVaultSetupTokenError);
  });

  test("should handle failure from performing GET on a setup vault token", async () => {
    const getVaultSetupTokenError = new Error(
      "error with get vault setup token"
    );

    // $FlowIssue
    getVaultSetupToken.mockRejectedValue(getVaultSetupTokenError);

    await savePaymentSource(defaultOptions);

    expect.assertions(3);
    expect(vaultWithoutPurchaseSuccess).not.toHaveBeenCalled();
    expect(vaultWithoutPurchaseFailure).toHaveBeenCalledWith({
      error: getVaultSetupTokenError,
      vaultToken: defaultVaultSetupToken,
    });
    expect(defaultOptions.onError).toBeCalledWith(getVaultSetupTokenError);
  });

  test("should handle failure from performing POST on a setup vault token", async () => {
    const updateVaultSetupTokenError = new Error(
      "error with update vault setup token"
    );

    // $FlowIssue
    updateVaultSetupToken.mockRejectedValue(updateVaultSetupTokenError);

    await savePaymentSource(defaultOptions);

    expect.assertions(3);
    expect(vaultWithoutPurchaseSuccess).not.toHaveBeenCalled();
    expect(vaultWithoutPurchaseFailure).toHaveBeenCalledWith({
      error: updateVaultSetupTokenError,
      vaultToken: defaultVaultSetupToken,
    });
    expect(defaultOptions.onError).toBeCalledWith(updateVaultSetupTokenError);
  });

  test("should handle failure from merchant-supplied onApprove", async () => {
    const onApproveError = new Error("error with on approve");
    const rejectOnApprove = vi.fn().mockRejectedValue(onApproveError);

    await savePaymentSource({
      ...defaultOptions,
      save: defaultSave({ onApprove: rejectOnApprove }),
    });

    expect.assertions(3);
    expect(vaultWithoutPurchaseSuccess).not.toHaveBeenCalled();
    expect(vaultWithoutPurchaseFailure).toHaveBeenCalledWith({
      error: onApproveError,
      vaultToken: defaultVaultSetupToken,
    });
    expect(defaultOptions.onError).toBeCalledWith(onApproveError);
  });

  test("should handle successful vault without purchase", async () => {
    await savePaymentSource(defaultOptions);

    expect.assertions(4);
    expect(defaultOptions.save.createVaultSetupToken).toHaveBeenCalled();
    expect(updateVaultSetupToken).toHaveBeenCalledWith({
      vaultSetupToken: "vault-setup-token",
      clientID: "client-id",
      paymentSource: {
        card: {
          expiry: "01/24",
          name: "John Doe",
          number: "4111111111111111",
          securityCode: "123",
        },
      },
    });
    expect(defaultOptions.save.onApprove).toHaveBeenCalledWith({
      vaultSetupToken: "vault-setup-token",
    });
    expect(vaultWithoutPurchaseSuccess).toHaveBeenCalledWith({
      vaultToken: defaultVaultSetupToken,
    });
  });
});
