/* @flow */

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { COUNTRY } from "@paypal/sdk-constants/src";
import { uniqueID } from "@krakenjs/belter/src";

import { getLogger } from "../lib/logger";

import {
  hcfTransactionError,
  hcfTransactionSuccess,
  setupCardLogger,
  vaultWithoutPurchaseFailure,
  vaultWithoutPurchaseSuccess,
} from "./logger";

vi.mock("../lib/logger", () => ({
  getLogger: vi.fn(),
  setupLogger: vi.fn(),
}));

const cardLoggerProps = {
  env: "test",
  sessionID: uniqueID(),
  clientID: uniqueID(),
  sdkCorrelationID: uniqueID(),
  cardSessionID: uniqueID(),
  partnerAttributionID: uniqueID(),
  merchantDomain: "mock://www.paypal.com",
  buyerCountry: COUNTRY.US,
  locale: {
    country: "US",
    lang: "en",
  },
  merchantID: ["XYZ12345"],
  type: "name",
  hcfSessionID: uniqueID(),
};

describe("card logger", () => {
  const infoMock = vi.fn();
  const trackMock = vi.fn().mockImplementation(() => ({
    flush: vi.fn(),
  }));

  beforeEach(() => {
    vi.useFakeTimers();

    // $FlowIssue .mockImplementation
    getLogger.mockImplementation(() => ({
      addTrackingBuilder: vi.fn(),
      addPayloadBuilder: vi.fn(),
      info: infoMock,
      track: trackMock,
      warn: vi.fn(),
      error: vi.fn(),
      flush: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call logger.track with setupCardLogger ", async () => {
    await setupCardLogger(cardLoggerProps);
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        event_name: "hcf_name_field_rendered",
        transition_name: "hcf_name_field_rendered",
      })
    );
  });

  it("should call logger.track with hcfTransactionError ", async () => {
    const error = new Error("testing hcf transaction error");
    await hcfTransactionError({ error });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        ext_error_code: "hcf_transaction_error",
        ext_error_desc: "testing hcf transaction error",
      })
    );
  });

  it("should call logger.track with hcfTransactionSuccess ", async () => {
    await hcfTransactionSuccess({ orderID: "ABCD123" });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        event_name: "hcf_transaction_success",
        transition_name: "hcf_transaction_success",
        order_id: "ABCD123",
      })
    );
  });

  it("should call logger.track with vaultWithoutPurchaseSuccess ", async () => {
    await vaultWithoutPurchaseSuccess({ vaultToken: "ABCD123efgh" });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        event_name: "hcf_vault_without_purchase_success",
        transition_name: "hcf_vault_without_purchase_success",
        vault_token: "ABCD123efgh",
      })
    );
  });

  it("should call logger.track with vaultWithoutPurchaseFailure ", async () => {
    const error = new Error("testing vault without purchase error");
    await vaultWithoutPurchaseFailure({ error });
    expect(trackMock).toBeCalledWith(
      expect.objectContaining({
        ext_error_code: "hcf_vault_without_purchase_error",
        ext_error_desc: "testing vault without purchase error",
      })
    );
  });
});
