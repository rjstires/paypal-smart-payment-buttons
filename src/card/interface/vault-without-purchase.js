/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  getVaultSetupToken,
  updateVaultSetupToken,
  type PaymentSourceInput,
} from "../../api/vault";
import type { SaveCardFieldsProps } from "../props";
import {
  vaultWithoutPurchaseSuccess,
  vaultWithoutPurchaseFailure,
} from "../logger";
import type { XOnError } from "../../props";

const onVaultWithoutPurchaseError = ({vaultToken, onError}: {|vaultToken?: string, onError: XOnError|}) => (error: mixed) => {
  vaultWithoutPurchaseFailure({
    vaultToken,
    error
  })

  onError(error)
}

type VaultPaymenSourceOptions = {|
  save: SaveCardFieldsProps["save"],
  onError: XOnError,
  clientID: string,
  facilitatorAccessToken: string,
  paymentSource: PaymentSourceInput,
|};

export const savePaymentSource = ({
  save,
  onError,
  facilitatorAccessToken,
  clientID,
  paymentSource,
}: VaultPaymenSourceOptions): ZalgoPromise<void> => {
  const { createVaultSetupToken, onApprove } = save;

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
