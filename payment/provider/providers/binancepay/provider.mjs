/**
 * Copyright 2022 HolyCorn Software
 * The Matazm Project
 * This module (binancepay) allows the system to collect payments using Binance Pay
 */

import PaymentProviderModel from "../../model.mjs";
import fs from 'node:fs'
import BinancePayClient from "./client.mjs";
import libPath from 'node:path'
import libUrl from 'node:url'
import shortUUID from "short-uuid";
import { CurrencyController } from "../../../../currency/controller.mjs";

const client = Symbol()



export default class BinancePay extends PaymentProviderModel {


    constructor() {
        super()

        this[client] = new BinancePayClient({ provider: this })

    }

    async init() {

    }

    /**
     * This method is used to debit a user using binance pay
     * @param {import("faculty/finance/payment/types.js").PaymentRecord} record 
     * @returns {Promise<void>}
     */
    async charge(record) {

        await BinancePay.toWalletCurrency(record)

        /** @type {{[key: import("faculty/finance/payment/types.js").PaymentRecord['meta']['product']['category']]: import('./types').BinancePayTypes.GoodsCategory}} */
        const categoryMap = {

            electronics: "0000",
            content: "1000",
            homeTools: "2000",
            fashion: "3000",
            child: "4000",
            automotive: "5000",
            credit: "6000",
            entertainment: "7000",
            jewelry: "8000",
            homeService: "9000",
            beauty: "A000",
            pharmacy: "B000",
            sports: "C000",
            food: "D000",
            pet: "E000",
            science: "F000",
            other: "Z000",
        }

        const bnbResp = await this[client].charge(
            {
                env: {
                    terminalType: "WEB",
                },
                currency: record.amount.currency,
                orderAmount: record.amount.value,
                goods: {
                    goodsCategory: categoryMap[record.meta?.product?.category || 'other'],
                    goodsDetail: record.meta?.product?.description || '',
                    goodsName: record.meta?.product?.name,
                    goodsType: record.meta?.product?.type == 'physical' ? '01' : '02',
                    referenceGoodsId: record.id,
                },
                merchantTradeNo: record.provider_data.merchantTradeNo = `${shortUUID.generate()}${shortUUID.generate()}`.substring(0, 32)
            }
        );

        const message = (record.client_data.output ||= {}).message ||= {};
        record.client_data.output = {
            universalUrl: bnbResp.data.universalUrl
        }
        message.text = message.html = `To complete the payment on binance pay, `
        message.text += `click this link: ${record.client_data.output.universalUrl}.`
        message.html += `<a href="${record.client_data.output.universalUrl}" target="_blank">click here</a>`

        record.client_data.output.message = message

    }

    /**
     * The system calls this method when it requests that the wallet transfers an amount of money to a given destination, within the capability of the wallet.
     * 
     * The method is async, and manipulates the Payout data directly to make changes
     * @param {import("../types.js").PaymentRecord} payout The information of where and how much to pay
     * @returns {Promise<void>}
     */
    async payout(payout) {
        throw new Exception(`Payout via BinancePay are not yet possible!`)
    }

    /**
     * The system calls this method on the provider when it wants to refresh the state of a transaction.
     * 
     * The provider therefore queries external sources to validate how much has been paid concerning the particular transaction as well as any errors that may have happened.
     * 
     * The provider should modify the necessary fields (e.g amount, expiry, done) according to the new state of the transaction.
     * 
     * Providers should have nothing to do with the lastRefresh field
     * @param {import("../../../types.js").PaymentRecord} record 
     * @returns {Promise<void>}
     */
    async refresh(record) {



        const status = await this[client].getChargeStatus({ merchantTradeNo: record.provider_data.merchantTradeNo })

        if (status.status === 'SUCCESS') {

            record.amount = {
                currency: status.data.currency,
                value: status.data.orderAmount
            }
            record.settled_amount = {
                currency: record.amount.currency,
                value: status.data.status === 'PAID' ? status.data.orderAmount : 0
            }

        } else {
            record.settled_amount = {
                currency: record.amount.currency,
                value: 0
            }
            record.failed = {
                reason: status.errorMessage,
                reason_code: status.code,
                time: Date.now()
            }
        }

    }

    /**
     * The system calls this method when it wants to check whether or not a given payment data is valid.
     * 
     * This payment data is usually entered by the user, and the data is usually used to charge the user
     * 
     * The provider should not throw any exceptions, as it will be considered failure to validate.
     * 
     * Rather the providers sets the sets the status to 'invalid'
     * 
     * Then set the reason why the payment data is wrong in 'message'
     * @param {import("../../types.js").PaymentUserInput} paymentData
     * @returns {Promise<import("../../../types.js").PaymentUserInputValidationResult>}
     */
    async validateUserInput(paymentData) {
        if (paymentData.intent === 'invoice' || /^[0-9]{9}$/.test(paymentData.data?.binancePayId)) {
            return {
                status: 'valid'
            }
        }
        return {
            status: 'invalid',
            message: `Sorry, your Binance Pay ID was supposed to be a nine (9) digit number`
        }

    }

    /**
     * This method is called by the system when determining if a payment method should be handled by a wallet
     * The provider returns true or false depending on whether it supports the named payment method
     * @param {string} paymentMethod 
     * @param {Promise<boolean>}
     */
    async matchProvider(paymentMethod) {
        return paymentMethod?.includes(`default.${this.$data.name}`)
    }
    /**
     * This method is called by the system in order to get the list of payment methods supported by this provider
     * 
     * @returns {Promise<import("faculty/finance/payment/types.js").ProviderPaymentMethodsInfo>}
     */
    async getPaymentMethodsInfo() {
        return [
            {
                code: `default.${this.$data.name}`,
                label: `Binance Pay`,
                image: {
                    data: fs.readFileSync(libPath.resolve(libUrl.fileURLToPath(import.meta.url), '../public/icon.png')),
                    mimeType: 'image/png'
                }
            }
        ]
    }

    /**
     * Providers should override this method so as to provide public clients with a form that can be filled when entering details for an invoice or payout
     * @param {object} param0
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @returns {Promise<import("/$/system/static/html-hc/widgets/multi-flex-form/types.js").MultiFlexFormDefinitionData}
     */
    async getInlineFormDataStructure({ intent, method }) {
        if (intent === 'invoice') {
            return undefined
        } else {
            return [
                [
                    {
                        label: `Binance ID`,
                        name: 'binancePayId',
                        type: 'text',
                    }
                ]
            ]
        }

    }

    /**
     * This method converts currency data in a record to that
     * @param {import("faculty/finance/payment/types.js").PaymentRecord} record 
     * @returns {Promise<void> }
     */
    static async toWalletCurrency(record) {
        if (record.amount.currency == this.WALLET_CURRENCY) {
            return
        }
        record.amount.value = await CurrencyController.convert(record.amount.value, record.amount.currency, this.WALLET_CURRENCY)
        record.amount.currency = this.WALLET_CURRENCY

    }

    static get WALLET_CURRENCY() {
        return 'USDT'
    }

    /**
     * The fields of the providers credentials in the database that will be sent to the client.
     * 
     * Set this if and only if the front-end UI needs access to certain credentials in order to function properly.
     * 
     * For example, you can return
     * ```
     * ['api_user', 'allowed_domains']
     * 
     * ```
     * @returns {[string]}
     * 
     */
    static get credential_fields() {
        return ["keyId", "secretKey"]
    }


    /**
     * The fields to that make up the credentials for the provider.
     * Specifying this will make the system check for incomplete data
     * 
     * @returns {[string]}
     */
    static get client_credential_fields() {

    }


}