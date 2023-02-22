/* @flow */
import type { Card } from "../types";
import type { PaymentSourceInput } from "../../api/vault";

export * from "./card-checks";
export * from "./card-focus";
export * from "./card-utils";
export * from "./exports";
export * from "./methods";

const cardExpiryToPaymentSourceExpiry = (dateString: string): string => {
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

    // if using 23 instead of 2023, the Date class will interpret the year as 1923
    const formattedYearString = yearString.length === 2 ? `20${yearString}` : yearString
    const date = new Date(parseInt(formattedYearString, 10), parseInt(monthString, 10))
    const rawMonth = date.getMonth();
    // the Date class returns month as 1-12, we'd like to append a 0 to numbers less than 10
    const formattedMonth = rawMonth < 10 ? `0${rawMonth}` : rawMonth.toString()

    return `${date.getFullYear()}-${formattedMonth}`
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
