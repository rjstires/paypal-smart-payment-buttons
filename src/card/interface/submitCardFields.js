/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src"
import { uniqueID } from "@krakenjs/belter"

import { getCardProps } from "../props"
import { confirmOrderAPI } from "../../api"
import { getLogger } from "../../lib"
import type { FeatureFlags } from "../../types"
import type { BillingAddress } from '../types'
import {convertCardToPaymentSource, reformatPaymentSource} from '../lib'

import { resetGQLErrors } from "./gql"
import { hasCardFields } from "./hasCardFields"
import { getCardFields } from "./getCardFields"
import { savePaymentSource } from "./vault-without-purchase"

type SubmitCardFieldsOptions = {|
  facilitatorAccessToken: string,
  featureFlags: FeatureFlags,
  extraFields?: {|
    billingAddress?: BillingAddress,
  |},
|};

export function submitCardFields({
  facilitatorAccessToken,
  extraFields,
  featureFlags,
}: SubmitCardFieldsOptions): ZalgoPromise<void> {
  const cardProps = getCardProps({
    facilitatorAccessToken,
    featureFlags,
  });

  resetGQLErrors();

  return ZalgoPromise.try(() => {
    if (!hasCardFields()) {
      throw new Error(`Card fields not available to submit`);
    }

    const card = getCardFields();

    if (cardProps.save) {
      return savePaymentSource({
        save: cardProps.save,
        onError: cardProps.onError,
        facilitatorAccessToken,
        clientID: cardProps.clientID,
        paymentSource: convertCardToPaymentSource(card, extraFields),
      });
    }

      // $FlowFixMe
      return cardProps
        .createOrder()
        .then((orderID) => {
          
          const payment_source = convertCardToPaymentSource(card, extraFields)
          // eslint-disable-next-line flowtype/no-weak-types
          const data: any = {
            payment_source: {
              // $FlowIssue
              card: reformatPaymentSource(payment_source.card)
            }
          }

          return confirmOrderAPI(orderID, data, {
            facilitatorAccessToken,
            partnerAttributionID: "",
          }).catch((error) => {
            getLogger().info("card_fields_payment_failed");
            if (cardProps.onError) {
              cardProps.onError(error);
            }
            throw error;
          });
        })
        .then((orderData) => {
          // $FlowFixMe
          return cardProps.onApprove(
            { payerID: uniqueID(), buyerAccessToken: uniqueID(), ...orderData },
            {
              restart: () => {
                throw new Error(`Restart not implemented for card fields flow`);
              },
            }
          );
        });
  });
}
