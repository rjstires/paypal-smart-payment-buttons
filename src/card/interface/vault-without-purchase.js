/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  getVaultSetupToken,
  updateVaultSetupToken,
  type PaymentSourceInput,
} from "../../api/vault";
import type {SaveCardFieldsProps} from '../props'

type VaultPaymenSourceOptions = {|
  save: SaveCardFieldsProps['save'],
  clientID: string,
  userIDToken: string,
  facilitatorAccessToken: string,
  paymentSource: PaymentSourceInput,
|};

export const savePaymentSource = ({
  save,
  facilitatorAccessToken,
  clientID,
  userIDToken,
  paymentSource,
}: VaultPaymenSourceOptions): ZalgoPromise<void> => {
  const { createVaultSetupToken, onApprove } = save;

  // happy path for now
  // need to add error cases with fpti events for each .then
  return createVaultSetupToken().then((vaultSetupToken) => {
    return getVaultSetupToken({
      vaultSetupToken,
      facilitatorAccessToken,
    }).then(() => {
      return updateVaultSetupToken({
        clientID,
        userIDToken,
        vaultSetupToken,
        paymentSource,
      }).then(() => {
        return onApprove({ vaultSetupToken });
      });
    });
  });
};
