/* @flow */
import { describe, beforeEach, vi, test, expect } from "vitest";

import { savePaymentSource } from "../../../src/card/interface/vault-without-purchase";
import { updateVaultSetupToken } from "../../../src/api/vault";

vi.mock("../../../src/api/vault", () => ({
  // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
  getVaultSetupToken: vi.fn(() => Promise.resolve()),
  // eslint-disable-next-line compat/compat, promise/no-native, no-restricted-globals
  updateVaultSetupToken: vi.fn(() => Promise.resolve()),
}));

const mockSave = (options = {}) => ({
  createVaultSetupToken: vi.fn().mockResolvedValue("vault-setup-token"),
  onApprove: vi.fn(),
  ...options,
});

describe("vault", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("save", () => {
    // coming back to this test and more once we implement more un-happy paths
    // test.skip("it should handle failure from createVaultSetupToken callback", () => {});

    test("should call the provided functions", async () => {
      const options = {
        save: mockSave(),
        userIDToken: "token",
        clientID: "client-id",
        paymentSource: {
          card: {
            billing_address: {
              postal_code: undefined,
            },
            expiry: "01/24",
            name: "John Doe",
            number: "4111111111111111",
            security_code: "123",
          },
        },
      };

      // $FlowIssue
      await savePaymentSource(options);

      expect.assertions(3);

      expect(options.save.createVaultSetupToken).toHaveBeenCalled();
      expect(updateVaultSetupToken).toHaveBeenCalledWith({
        vaultSetupToken: "vault-setup-token",
        userIDToken: "token",
        clientID: "client-id",
        paymentSource: {
          card: {
            billing_address: {
              postal_code: undefined,
            },
            expiry: "01/24",
            name: "John Doe",
            number: "4111111111111111",
            security_code: "123",
          },
        },
      });
      expect(options.save.onApprove).toHaveBeenCalledWith({
        vaultSetupToken: "vault-setup-token",
      });
    });
  });
});
