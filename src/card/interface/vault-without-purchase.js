/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  updateVaultSetupToken,
  type PaymentSourceInput,
} from "../../api/vault";
import {
  vaultWithoutPurchaseSuccess,
  vaultWithoutPurchaseFailure,
} from "../logger";
import type {
  XOnError,
  XCreateVaultSetupToken,
  SaveActionOnApprove,
} from "../../props";

const onVaultWithoutPurchaseError =
  ({ vaultToken, onError }: {| vaultToken?: string, onError: XOnError |}) =>
  (error: mixed) => {
    vaultWithoutPurchaseFailure({
      vaultToken,
      error,
    });

    onError(error);
  };

type VaultPaymenSourceOptions = {|
  createVaultSetupToken: XCreateVaultSetupToken,
  onApprove: SaveActionOnApprove,
  onError: XOnError,
  clientID: string,
  paymentSource: PaymentSourceInput,
  idToken: string,
|};

export const savePaymentSource = ({
  createVaultSetupToken,
  onApprove,
  onError,
  clientID,
  paymentSource,
  idToken,
}: VaultPaymenSourceOptions): ZalgoPromise<void> => {
  return createVaultSetupToken()
    .then((vaultSetupToken) =>
      updateVaultSetupToken({
        vaultSetupToken,
        clientID,
        paymentSource,
        // passing the id token here is a temporary fix until we can deploy xobuyernodeserv
        // to treak idToken as an optional field.
        idToken,
      })
        .then(() => onApprove({ vaultSetupToken }))
        .then(() =>
          vaultWithoutPurchaseSuccess({ vaultToken: vaultSetupToken })
        )
        .catch(
          onVaultWithoutPurchaseError({ onError, vaultToken: vaultSetupToken })
        )
    )
    .catch(onVaultWithoutPurchaseError({ onError }));
};
