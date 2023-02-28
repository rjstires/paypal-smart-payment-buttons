/* @flow */
import type { Card } from "../types";
import type { PaymentSourceInput } from "../../api/vault";

export * from "./card-checks";
export * from "./card-focus";
export * from "./card-utils";
export * from "./exports";
export * from "./methods";

export const cardExpiryToPaymentSourceExpiry = (dateString: string): string => {
  if (!dateString || typeof dateString !== "string") {
    throw new Error(`can not convert invalid expiry date: ${dateString}`);
  }

  // "2020-12"
  const YYYYmmRegex = "^[0-9]{4}-([1-9]|0[1-9]|1[0-2])$";
  // 12/20 OR 12/2020
  const mmYYYYRegex = "^([1-9]|0[1-9]|1[0-2])/?([0-9]{4}|[0-9]{2})$";

  if (dateString.match(YYYYmmRegex)) {
    return dateString;
  }

  if (dateString.match(mmYYYYRegex)) {
    const [monthString, yearString] = dateString.split("/");
    
    const formattedYearString = yearString.length === 2 ? `20${yearString}` : yearString;
    const formattedMonthString = monthString.length === 1 ? `0${monthString}` : monthString;

    return `${formattedYearString}-${formattedMonthString}`;
  }

  throw new Error(`can not convert invalid expiry date: ${dateString}`);
};

export const convertCardToPaymentSource = (card: Card): PaymentSourceInput => {
  const paymentSource = {
    card: {
      number: card.number,
      securityCode: card.cvv,
      expiry: cardExpiryToPaymentSourceExpiry(card.expiry),
    },
  };

  if (card.name) {
    // $FlowIssue
    paymentSource.card.name = card.name;
  }

  if (card.postalCode) {
    // $FlowIssue
    paymentSource.card.billingAddress = { postalCode: card.postalCode };
  }

  return paymentSource;
};
