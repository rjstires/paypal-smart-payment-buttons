/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src"
import { uniqueID } from "@krakenjs/belter"

import { getCardProps } from "../props"
import { confirmOrderAPI } from "../../api"
import { getLogger } from "../../lib"
import type { ExtraFields } from "../types"
import type { FeatureFlags } from "../../types"
import {convertCardToPaymentSource} from '../lib'

import { resetGQLErrors } from "./gql"
import { hasCardFields } from "./hasCardFields"
import { getCardFields } from "./getCardFields"
import { savePaymentSource } from "./vault-without-purchase"
import { reformatExpiry } from "./reformatExpiry"

type CardValues = {|
  number: ?string,
  expiry?: ?string,
  security_code?: ?string,
  postalCode?: ?string,
  name?: ?string,
  ...ExtraFields,
|};

type SubmitCardFieldsOptions = {|
  facilitatorAccessToken: string,
  featureFlags: FeatureFlags,
  extraFields?: {|
    billingAddress?: string,
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
        facilitatorAccessToken,
        clientID: cardProps.clientID,
        userIDToken: cardProps.userIDToken,
        paymentSource: convertCardToPaymentSource(card),
      });
    }

      // $FlowFixMe
      return cardProps
        .createOrder()
        .then((orderID) => {
          const cardObject: CardValues = {
            name: card.name,
            number: card.number,
            expiry: reformatExpiry(card.expiry),
            security_code: card.cvv,
            ...extraFields,
          };

          if (card.name) {
            cardObject.name = card.name;
          }

          // eslint-disable-next-line flowtype/no-weak-types
          const data: any = {
            payment_source: {
              card: cardObject,
            },
          };
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
