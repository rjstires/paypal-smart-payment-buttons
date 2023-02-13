/** @flow */

import { uniqueID } from "@krakenjs/belter/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { type LoggerType } from '@krakenjs/beaver-logger/src';

import { getLogger } from "../lib";
import { patchShipping, patchOrder, type PatchData, type OrderAPIOptions, type OrderResponse, type PatchShippingArgs } from "../api";


import { getOnShippingChange } from "./onShippingChange";

jest.mock("../api");
jest.mock("./createOrder");
jest.mock("../lib");

const mockPatchOrder: JestMockFn<[string, PatchData, OrderAPIOptions], ZalgoPromise<OrderResponse>> = patchOrder;

const mockPatchShipping: JestMockFn<[PatchShippingArgs], ZalgoPromise<OrderResponse>> = patchShipping;

const mockGetLogger: JestMockFn<[], LoggerType> = getLogger;

describe("onShippingChange", () => {
    describe("getOnShippingChange", () => {
        let clientID;
        let facilitatorAccessToken;
        let partnerAttributionID;
        let orderID;
        const createOrder = jest.fn();
        const invocationActions = {
            reject: () => ZalgoPromise.reject(),
            resolve: () => ZalgoPromise.resolve(),
        };
        const featureFlags = { isLsatUpgradable: false };

        beforeEach(() => {
            clientID = uniqueID();
            facilitatorAccessToken = uniqueID();
            partnerAttributionID = uniqueID();
            orderID = uniqueID();
            createOrder.mockImplementation(() => ZalgoPromise.resolve(orderID));
            
            // $FlowFixMe
            mockGetLogger.mockReturnValue({
                // $FlowFixMe
                info: () => ({
                    // $FlowFixMe
                    track: () => ({ flush: () => undefined }),
                }),
            });
        });

        it("should call patchOrder", async () => {
            // $FlowFixMe
            mockPatchOrder.mockImplementation(() => ZalgoPromise.resolve({}));

            const patchData = [];
            const onShippingChange = jest.fn((data, actions) => {
                actions.order.patch(patchData);
                return ZalgoPromise.resolve();
            });

            const experiments = { useShippingChangeCallbackMutation: false };

            const buyerAccessToken = uniqueID();

            const fn = getOnShippingChange(
                {
                    onShippingChange,
                    partnerAttributionID,
                    featureFlags,
                    experiments,
                    clientID,
                },
                { facilitatorAccessToken, createOrder }
            );

            const data = { buyerAccessToken };

            if (fn) {
                await fn(data, invocationActions);
                expect(patchOrder).toBeCalledWith(orderID, patchData, {
                    facilitatorAccessToken,
                    buyerAccessToken,
                    partnerAttributionID,
                    forceRestAPI: featureFlags.isLsatUpgradable,
                });
            }

            expect.assertions(1);
        });

        it("should call patchShipping when experiment is active", async () => {
            // $FlowFixMe
            mockPatchShipping.mockImplementation(() => ZalgoPromise.resolve({}));

            const patchData = [];
            const onShippingChange = jest.fn((data, actions) => {
                actions.order.patch(patchData);
                return ZalgoPromise.resolve();
            });

            const experiments = { useShippingChangeCallbackMutation: true };

            const fn = getOnShippingChange(
                {
                    onShippingChange,
                    partnerAttributionID,
                    featureFlags,
                    experiments,
                    clientID,
                },
                { facilitatorAccessToken, createOrder }
            );

            if (fn) {
                await fn({}, invocationActions);
            }

            expect(patchShipping).toBeCalledWith({
                clientID,
                data: patchData,
                orderID,
            });

            expect.assertions(1);
        });
    });
});
