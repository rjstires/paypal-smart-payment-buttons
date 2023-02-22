/* @flow */
import { convertCardToPaymentSource } from "./index";

const testCard = "4111111111111111";
const testSecurityCode = "100";
const testName = "Lewis Hamilton";
const testPostalCode = "60647";

const goodShortDate = "03/23";
const goodLongDate = "03/23";
const goodFormattedDate = "2023-03";
const badDate = "030/023";

describe("convertCardToPaymentSource", () => {
  test.each([
    [
      "basic card",
      { number: testCard, expiry: goodShortDate, cvv: "100" },
      {
        card: {
          number: testCard,
          expiry: goodFormattedDate,
          securityCode: testSecurityCode,
        },
      },
    ],
    [
      "with all fields",
      {
        number: testCard,
        expiry: goodLongDate,
        cvv: "100",
        name: testName,
        postalCode: testPostalCode,
      },
      {
        card: {
          number: testCard,
          expiry: goodFormattedDate,
          securityCode: testSecurityCode,
          name: testName,
          billingAddress: {
            postalCode: testPostalCode,
          },
        },
      },
    ],
  ])(
    "should convert card object to payment source: %s",
    (_, card, paymentSource) => {
      expect(convertCardToPaymentSource(card)).toEqual(paymentSource);
    }
  );

  test("should throw error for bad date", () => {
    expect(
      () => convertCardToPaymentSource({
        number: testCard,
        expiry: badDate,
        cvv: testSecurityCode,
      })
    ).toThrowError(`can not convert invalid expiry date: ${badDate}`);
  });
});
