/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { COUNTRY, FPTI_KEY } from '@paypal/sdk-constants/src';

import { patchShipping, type OrderResponse } from '../api';
import { FPTI_TRANSITION, FPTI_CONTEXT_TYPE, FPTI_CUSTOM_KEY } from '../constants';
import { getLogger } from '../lib';
import type { OrderAmount } from '../types';

import type { CreateOrder } from './createOrder';

export type SHIPPING_OPTION_TYPE = 'SHIPPING' | 'PICKUP';
export type ON_SHIPPING_CHANGE_EVENT = 'add' | 'replace';

export const ON_SHIPPING_CHANGE_PATHS = {
    AMOUNT:  ("/purchase_units/@reference_id=='default'/amount" : "/purchase_units/@reference_id=='default'/amount"),
    OPTIONS: ("/purchase_units/@reference_id=='default'/shipping/options" : "/purchase_units/@reference_id=='default'/shipping/options")
};

export const SHIPPING_ADDRESS_ERROR_MESSAGES = {
    ADDRESS_ERROR: ("Your order can't be shipped to this address." : "Your order can't be shipped to this address."),
    COUNTRY_ERROR: ("Your order can't be shipped to this country." : "Your order can't be shipped to this country."),
    STATE_ERROR :  ("Your order can't be shipped to this state." : "Your order can't be shipped to this state."),
    ZIP_ERROR:     ("Your order can't be shipped to this zip." : "Your order can't be shipped to this zip.")
};

export const SHIPPING_OPTIONS_ERROR_MESSAGES = {
    METHOD_UNAVAILABLE: `The shipping method you chose is unavailable. To continue, choose another way to get your order.`,
    STORE_UNAVAILABLE:  `Part of your order isn't available at this store.`
};

export const GENERIC_REJECT_ADDRESS_MESSAGE = 'Unable to update address. Please try again.';

export type ShippingOption = {|
    id? : string,
    label : string,
    selected : boolean,
    type : SHIPPING_OPTION_TYPE,
    amount : {|
        currency_code : string,
        value : string
    |}
|};

export type Query = {|
    op : ON_SHIPPING_CHANGE_EVENT,
    path : string,
    value : mixed
|};

export type XOnShippingChangeDataType = {|
    orderID? : string,
    paymentID? : string,
    paymentToken? : string,
    shipping_address? : {|
        city : string,
        state : string,
        country_code : $Values<typeof COUNTRY>,
        postal_code : string
    |},
    selected_shipping_option? : ShippingOption,
    buyerAccessToken? : ?string,
    forceRestAPI? : boolean,
    amount? : OrderAmount
|};

export type XOnShippingChangeActionsType = {|
    resolve : () => ZalgoPromise<void>,
    reject : (string) => ZalgoPromise<void>,
    order : {|
        patch : () => ZalgoPromise<OrderResponse>
    |}
|};

export type XOnShippingChange = (XOnShippingChangeDataType, XOnShippingChangeActionsType) => ZalgoPromise<void>;

export function buildXOnShippingChangeData(data : XOnShippingChangeDataType) : XOnShippingChangeDataType {
    return data;
}

export type OnShippingChangeData = {|
    amount? : OrderAmount,
    orderID? : string,
    paymentID? : string,
    paymentToken? : string,
    shipping_address? : {|
        city : string,
        state : string,
        country_code : $Values<typeof COUNTRY>,
        postal_code : string
    |},
    selected_shipping_option? : ShippingOption,
    buyerAccessToken? : ?string,
    forceRestAPI? : boolean
|};

export type OnShippingChangeActionsType = {|
    resolve : () => ZalgoPromise<void>,
    reject : (string) => ZalgoPromise<void>
|};

export function buildXShippingChangeActions({ orderID, clientID, actions } : {| orderID : string, clientID : string, actions : OnShippingChangeActionsType |}) : XOnShippingChangeActionsType {

    const patch = (data = {}) => {
        return patchShipping({ orderID, data, clientID }).catch(() => {
            throw new Error('Order could not be patched');
        })
    };

    const resolve = () => ZalgoPromise.resolve();
    const reject = actions.reject || function reject() {
        throw new Error(`Missing reject action callback`);
    };

    return {
        resolve,
        reject,
        order: { patch }
    };
}

export type OnShippingChange = (OnShippingChangeData, OnShippingChangeActionsType) => ZalgoPromise<void>;

type OnShippingChangeXProps = {|
    onShippingChange : ?XOnShippingChange,
    clientID : string,
|};

export function getOnShippingChange({ onShippingChange, clientID } : OnShippingChangeXProps, { createOrder } : {| createOrder : CreateOrder |}) : ?OnShippingChange {
    if (onShippingChange) {
        return ({
            ...data
        }, actions) => {
            return createOrder().then(orderID => {
                getLogger()
                    .info('button_shipping_change')
                    .track({
                        [FPTI_KEY.TRANSITION]:                       FPTI_TRANSITION.CHECKOUT_SHIPPING_CHANGE,
                        [FPTI_KEY.EVENT_NAME]:                       FPTI_TRANSITION.CHECKOUT_SHIPPING_CHANGE,
                        [FPTI_KEY.CONTEXT_TYPE]:                     FPTI_CONTEXT_TYPE.ORDER_ID,
                        [FPTI_KEY.TOKEN]:                            orderID,
                        [FPTI_KEY.CONTEXT_ID]:                       orderID,
                        [FPTI_CUSTOM_KEY.SHIPPING_CALLBACK_INVOKED]: '1'
                    }).flush();

                return onShippingChange(buildXOnShippingChangeData(data), buildXShippingChangeActions({ orderID, clientID, actions }));
            });
        };
    }
}
