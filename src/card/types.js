/* eslint-disable flowtype/require-exact-type */
/* @flow */

import { COUNTRY } from '@paypal/sdk-constants/src';

import type { FeatureFlags } from "../types"

export type SetupCardOptions = {|
    cspNonce : string,
    facilitatorAccessToken : string,
    featureFlags: FeatureFlags,
    buyerCountry : $Values<typeof COUNTRY>,
    metadata: {|
        correlationID: string,
        spbVersion: string
    |}
|};

export type Card = {
    number : ?string,
    cvv? : ?string,
    expiry? : ?string,
    name? : ?string,
    postalCode? : ?string
};

export type FieldStyle = {|
    appearance? : string,
    color? : string,
    direction? : string,
    font? : string,
    fontFamily? : string,
    fontSizeAdjust? : string,
    fontSize? : string,
    fontStretch? : string,
    fontStyle? : string,
    fontVariantAlternates? : string,
    fontVariantCaps? : string,
    fontVariantEastAsian? : string,
    fontVariantLigatures? : string,
    fontVariantNumeric? : string,
    fontVariant? : string,
    fontWeight? : string,
    letterSpacing? : string,
    lineHeight? : string,
    opacity? : string,
    outline? : string,
    padding? : string,
    paddingTop? : string,
    paddingRight? : string,
    paddingBottom? : string,
    paddingLeft? : string,
    textShadow? : string,
    transition? : string,
    MozApperance?: string,
    MozOsxFontSmoothing?: string,
    MozTapHighlightColor?: string,
    MozTransition?: string,
    WebkitAppearance?: string,
    WebkitOsxFontSmoothing?: string,
    WebkitTapHighlightColor?: string,
    WebkitTransition?: string
|};

export type CardStyle = {| |};

export type CardPlaceholder = {|
    number? : string,
    expiry? : string,
    cvv? : string,
    name? : string,
    postal?: string
|};

export type CardTypeCode = {|
    name : string,
    size : number
 |}

export type CardType = {|
    gaps : $ReadOnlyArray<number>,
    lengths : $ReadOnlyArray<number>,
    patterns : $ReadOnlyArray<number>,
    matchStrength? : number,
    type : string,
    niceType : string,
    code : CardTypeCode
|};

export type ParsedCardType = {|
    type: string,
    niceType: string,
    code : CardTypeCode
|};

export type CardFieldState = {|
    isEmpty: boolean,
    isValid: boolean,
    isPotentiallyValid: boolean,
    isFocused: boolean
|}

export type FieldsState = {
    cardNameField? : CardFieldState,
    cardNumberField : CardFieldState,
    cardExpiryField : CardFieldState,
    cardCvvField : CardFieldState,
    cardPostalCodeField? : CardFieldState
}

export type CardFieldsState = {
    cards : $ReadOnlyArray<ParsedCardType>,
    fields: FieldsState
};

export type InputEvent = {|
    key : string,
    target : HTMLInputElement,
    type? : string,
    keyCode? : number
|};

export type CardNumberChangeEvent = {|
    cardNumber : string,
    potentialCardTypes : CardType,
|};

export type CardExpiryChangeEvent = {|
    maskedDate : string,
|};

export type CardCvvChangeEvent = {|
    cardCvv : string
|};

export type CardNameChangeEvent = {|
    cardName : string
|};

export type CardPostalCodeChangeEvent = {|
    event? : InputEvent,
    cardPostalCode : string
|};

export type FieldValidity = {|
    isValid : boolean,
    isPotentiallyValid : boolean
|};

export type CardNavigation = {|
    next : () => void,
    previous : () => void
|};

export type InputState = {|
    inputValue : string,
    maskedInputValue : string,
    cursorStart : number,
    cursorEnd : number,
    keyStrokeCount : number,
    isPotentiallyValid : boolean,
    isFocused : boolean,
    isValid : boolean,
    contentPasted? : boolean,
    displayCardIcon?: boolean
|};

export type InputOptions = {|
    inputState : InputState,
    validationFn : () => mixed
|};

export type ExtraFields = {|
    billingAddress? : string
|};
/* eslint-enable flowtype/require-exact-type */
