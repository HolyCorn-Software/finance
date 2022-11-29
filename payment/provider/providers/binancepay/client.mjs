/**
 * Copyright 2022 HolyCorn Software
 * The Matazm Project
 * This module (client) is used to make requests via Binance Pay APIs.
 */

import shortUUID from "short-uuid";
import BinancePay from "./provider.mjs";
import crypto from 'node:crypto'
import fetch from 'node-fetch'


const provider = Symbol()

export default class BinancePayClient {


    /**
     * 
     * @param {object} param0
     * @param {BinancePay} param0.provider 
     */
    constructor(param0) {

        this[provider] = param0.provider

    }

    /**
     * This method is used to initiate a charge with BinancePay
     * @param {import("./types.js").BinancePayTypes.ChargeRequest} data 
     * @returns {Promise<import("./types.js").BinancePayTypes.ChargeResponse>}
     */
    async charge(data) {

        return await this.request(
            {
                path: '/binancepay/openapi/v2/order',
                method: 'POST',
                body: data
            }
        )

    }

    /**
     * This method is used to get the status of a charge request
     * @param {object} param0 
     * @param {string} param0.merchantTradeNo
     * @returns {Promise<import("./types.js").BinancePayTypes.ChargeStatus>}
     */
    async getChargeStatus({ merchantTradeNo }) {
        return await this.request(
            {
                path: `/binancepay/openapi/v2/order/query`,
                body: {
                    merchantTradeNo
                }
            }
        )
    }

    /**
     * This method is used to close an order
     * @param {object} param0 
     * @param {string} merchantTradeNo
     * @returns {Promise<import("./types.js").BinancePayTypes.CloseResponse>}
     */
    async closeOrder({ merchantTradeNo }) {
        return await this.request(
            {
                path: `/binancepay/openapi/order/close`,
                body: {
                    merchantTradeNo
                }
            }
        )
    }


    /**
     * This method is used to make a standard request via Binance Pay APIs
     * @param {object} param0
     * @param {string} param0.path 
     * @param {object} param0.body 
     * @param {("POST"|"GET")} param0.method
     * @returns {Promise<object>}
     */
    async request({ path, body, method }) {

        const jsonText = JSON.stringify(body);
        const { timestamp, nonce, keyId, signature } = await this.sign(jsonText);


        method = (method || 'POST').toUpperCase()

        const response = await fetch(
            `${BinancePayClient.URL}${path}`,
            {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'BinancePay-Timestamp': `${timestamp}`,
                    'BinancePay-Nonce': nonce,
                    'BinancePay-Certificate-SN': keyId,
                    'BinancePay-Signature': signature
                },
                body: method === 'GET' ? undefined : jsonText
            }

        );
        const json = await response.json()

        if (json.errorMessage) {
            console.log(`nonce(${nonce.length}) is `, nonce)
            throw new Error(`Error from Binance API:\n${json.errorMessage}`)
        }

        return json

    }
    static get URL() {
        return 'https://bpay.binanceapi.com'
    }

    /**
     * This method is used to sign data according to BinancePay's authentication system
     * @param {string} textdata 
     * @returns {Promise<{nonce:string, signature:string, keyId: string, timestamp: number}>}
     */
    async sign(textdata) {

        const nonce = `${shortUUID.generate()}${shortUUID.generate()}${shortUUID.generate()}`.replaceAll(/[^A-Za-z]/g, '').substring(0, 32)
        const credentials = await this.getCredentials()
        const timestamp = Date.now()
        return {
            signature: crypto.createHmac('sha512', credentials.secretKey).update(`${timestamp}\n${nonce}\n${textdata}\n`).digest('hex').toUpperCase(),
            keyId: credentials.keyId,
            nonce,
            timestamp
        }


    }

    /**
     * This method returns credentials needed by the client to function
     * @returns {Promise<import("./types.js").BinancePayCredentials>}
     */
    async getCredentials() {
        return await this[provider].$data.credentials_collection.findOne({ name: this[provider].$data.name })
    }

}