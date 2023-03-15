/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  getVaultSetupToken,
  updateVaultSetupToken,
  type PaymentSourceInput,
} from "../../api/vault";
import {
  vaultWithoutPurchaseSuccess,
  vaultWithoutPurchaseFailure,
} from "../logger";
import type { XOnError, XCreateVaultSetupToken, SaveActionOnApprove } from "../../props";

const onVaultWithoutPurchaseError = ({vaultToken, onError}: {|vaultToken?: string, onError: XOnError|}) => (error: mixed) => {
  vaultWithoutPurchaseFailure({
    vaultToken, error
  })

  onError(error)
}

type VaultPaymenSourceOptions = {|
  createVaultSetupToken: XCreateVaultSetupToken,
  onApprove: SaveActionOnApprove,
  onError: XOnError,
  clientID: string,
  facilitatorAccessToken: string,
  paymentSource: PaymentSourceInput,
|};

export const savePaymentSource = ({
  createVaultSetupToken,
  onApprove,
  onError,
  facilitatorAccessToken,
  clientID,
  paymentSource,
}: VaultPaymenSourceOptions): ZalgoPromise<void> => {

  return createVaultSetupToken()
    .then((vaultSetupToken) =>
      getVaultSetupToken({
        vaultSetupToken,
        facilitatorAccessToken,
      })
        .then(() =>
          updateVaultSetupToken({
            vaultSetupToken,
            clientID,
            paymentSource,
          })
        )
        .then(() => onApprove({ vaultSetupToken }))
        .then(() =>
          vaultWithoutPurchaseSuccess({ vaultToken: vaultSetupToken })
        )
        .catch(onVaultWithoutPurchaseError({onError, vaultToken: vaultSetupToken}))
    )
    .catch(onVaultWithoutPurchaseError({onError}));
};
