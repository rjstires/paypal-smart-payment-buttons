/* @flow */

import { randomBytes } from 'crypto';

import express from 'express';

import type { ExpressRequest, ExpressResponse } from './types';
import { getButtonMiddleware } from './buttons';
import { getMenuMiddleware } from './menu';

const app = express();
const PORT = process.env.PORT || 8003;

const buttonMiddleware = getButtonMiddleware({
    getFundingEligibility: () => {
        return Promise.resolve({
            paypal: {
                eligible: true
            }
        });
    },
    clientIDToMerchantID: () => {
        return Promise.resolve('XYZ12345');
    },
    getPersonalization: () => {
        return Promise.resolve({
            tagline: {
                text:     'foo',
                tracking: {
                    impression: 'https://www.google.com/foobar'
                }
            }
        });
    }
});

const menuMiddleware = getMenuMiddleware({});

app.get('/smart/buttons', (req : ExpressRequest, res : ExpressResponse) => {
    const nonce = randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9_]/g, '');

    res.locals = res.locals || {};
    res.locals.nonce = nonce;

    res.header('content-security-policy', `style-src self 'nonce-${ nonce }'; script-src self 'nonce-${ nonce }';`);
    
    return buttonMiddleware(req, res);
});

app.get('/smart/menu', (req : ExpressRequest, res : ExpressResponse) => {
    const nonce = randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9_]/g, '');

    res.locals = res.locals || {};
    res.locals.nonce = nonce;

    res.header('content-security-policy', `style-src self 'nonce-${ nonce }'; script-src self 'nonce-${ nonce }';`);

    return menuMiddleware(req, res);
});


app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`
        Smart Button server listening
          - http://localhost.paypal.com:${ PORT }/smart/buttons?clientID=alc_client1
          - http://localhost.paypal.com:${ PORT }/smart/menu?clientID=alc_client1
    
    `);
});