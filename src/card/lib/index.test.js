/* @flow */
import { convertCardToPaymentSource, cardExpiryToPaymentSourceExpiry } from "./index";

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

describe("cardExpiryToPaymentSourceExpiry", () => {
  it("returns the same input string when the input string is already in YYYY-mm format", () => {
    const input = "2023-02";
    expect(cardExpiryToPaymentSourceExpiry(input)).toEqual(input);
  });

  it("converts mm/YYYY input to YYYY-mm format for first month", () => {
    const input1 = "01/2024";
    const input2 = "1/24";
    const expectedOutput = "2024-01";
    expect(cardExpiryToPaymentSourceExpiry(input1)).toEqual(expectedOutput);
    expect(cardExpiryToPaymentSourceExpiry(input2)).toEqual(expectedOutput);
  });

  it("converts mm/YYYY input to YYYY-mm format for a middle month", () => {
    const input1 = "04/2024";
    const input2 = "4/24";
    const expectedOutput = "2024-04";
    expect(cardExpiryToPaymentSourceExpiry(input1)).toEqual(expectedOutput);
    expect(cardExpiryToPaymentSourceExpiry(input2)).toEqual(expectedOutput);
  });

  it("converts mm/YYYY input to YYYY-mm format for last month", () => {
    const input1 = "12/2024";
    const input2 = "12/24";
    const expectedOutput = "2024-12";
    expect(cardExpiryToPaymentSourceExpiry(input1)).toEqual(expectedOutput);
    expect(cardExpiryToPaymentSourceExpiry(input2)).toEqual(expectedOutput);
  });

  it("throws an error when the input string is not in the expected format", () => {
    const input = "2023/02";
    expect(() => {
      cardExpiryToPaymentSourceExpiry(input);
    }).toThrowError(`can not convert invalid expiry date: ${input}`);
  });

  it("throws an error when the input is empty", () => {
    const input = "";
    expect(() => {
      cardExpiryToPaymentSourceExpiry(input);
    }).toThrowError(`can not convert invalid expiry date: ${input}`);
  });
});
