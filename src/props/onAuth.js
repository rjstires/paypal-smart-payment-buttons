/* @flow */

import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { stringifyError } from '@krakenjs/belter/src';

import { upgradeFacilitatorAccessToken } from '../api';
import { getLogger } from '../lib';
import type { FeatureFlags } from '../types';

import type { CreateOrder } from './createOrder';
import type { CreateSubscription } from './createSubscription';

export type XOnAuthDataType = {|
    accessToken : ?string
|};

export type OnAuth = (params : XOnAuthDataType) => ZalgoPromise<string | void>;

type GetOnAuthOptions = {|
    facilitatorAccessToken : string,
    createOrder : CreateOrder,
    createSubscription : ?CreateSubscription,
    featureFlags: FeatureFlags
|};

export function getOnAuth({ facilitatorAccessToken, createOrder, createSubscription, featureFlags } : GetOnAuthOptions) : OnAuth {
    return ({ accessToken } : XOnAuthDataType) => {
        getLogger().info(`spb_onauth_access_token_${ accessToken ? 'present' : 'not_present' }`);

        return ZalgoPromise.try(() => {
            if (accessToken) {
                if (featureFlags.isLsatUpgradable) {
                    return createOrder()
                        .then(orderID => {
                            if (createSubscription) {
                                return accessToken;
                            }

                            return upgradeFacilitatorAccessToken(facilitatorAccessToken, { buyerAccessToken: accessToken, orderID });
                        })
                        .then(() => {
                            getLogger().info(`upgrade_lsat_success`);
                            return accessToken;
                        })
                        .catch(err => {
                            getLogger().warn('upgrade_lsat_failure', { error: stringifyError(err) });
                            return accessToken;
                        });
                }

                return accessToken;
            }
        });
    };
}
