/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance.
 * 
 * This module allows the system to make transactions with MoMo, using Flutterwave
 */

import PaymentProviderModel from "../../model.mjs";

import Flutterwave from 'flutterwave-node-v3'

import libUrl from 'node:url'
import fs from 'node:fs'
import { Exception } from "../../../../../../system/errors/backend/exception.js";




export default class FlutterwaveMoMo extends PaymentProviderModel {

    constructor({ public_key, secret_key }) {
        super()
        this.client = new Flutterwave(public_key, secret_key)
    }

    async init() {
        //Well, we have nothing to initialize
    }



    /**
     * @override
     * 
     * @param {import("../../../types.js").PaymentRecord} record The amount to be paid
     * @returns {Promise<void>}
     */
    async payout(record) {

        throw new Exception(`Cannot yet send money to another !`, {
            code: 'error.system.unplanned'
        })


    }

    /**
     * @override
     * @param {string} paymentMethod 
     * @returns {Promise<boolean>}
     */
    async matchProvider(paymentMethod) {
        return /^flutterwave\.momo\.((mtn_momo)|(orange_money))$/i.test(paymentMethod)
    }


    /**
     * @override  
     * @param {import("../../types.js").PaymentUserInput} paymentData 
     * @returns {Promise<import("../../../types.js").PaymentUserInputValidationResult>}
     */
    async validateUserInput(paymentData) {

        //Both payouts and invoices use the same payment data details
        let normalized_phone = FlutterwaveMoMo.normalizePhone(paymentData.data.phone_number)

        let is_okay = /(237){0,1}6[7895][0-9]{7}/.test(normalized_phone)

        return {
            status: is_okay ? 'valid' : 'invalid',
            message: is_okay ? `Please check that the phone number is a valid ${paymentData.paymentMethod === 'flutterwave.momo.mtn_momo' ? 'MTN' : 'Orange'} Cameroon phone number` : `Okay`
        }

    }



    /**
     * @override
     * @param {import("../../../types.js").PaymentRecord} record
     * @returns {Promise<void>}
     */
    async charge(record) {

        let client_phone = record.client_data.input.phone_number?.toString()

        if (typeof client_phone === 'undefined' || (client_phone.length !== 9 && client_phone.length !== 12)) {
            console.trace(`invalid phone. User input is`, record.client_data.input)
            throw new Exception(`Invalid phone number (${client_phone}). Please enter a Cameroonian phone number`, {
                code: 'error.input.validation'
            })
        }

        client_phone = FlutterwaveMoMo.normalizePhone(client_phone)

        record.client_data.input.phone_number = client_phone;

        record.amount = await FlutterwaveMoMo.convertToWalletCurrency(record.amount);


        let data = await this.client.MobileMoney.franco_phone({
            phone_number: client_phone,
            amount: record.amount.value,
            currency: record.amount.currency,
            email: `${record.owners[0] || 'system'}@userid.people.cayofed.cm`,
            tx_ref: record.id
        });
        record.creationTime = Date.now();

        if (data.status === 'error') {
            console.log(`Flutterwave:\n`, data)
            throw new Exception(`Cannot charge via Flutterwave because: ${data.message}`, { code: 'error.system.unplanned' })
        }

        let external_id = data.data.id
        record.provider_data.external_id = external_id;

        record.client_data.output ||= {}
        record.client_data.output.message ??= {};

        record.client_data.output.message.text = record.client_data.output.message.html = `Please dial *126# and confirm the transaction.\nTransactions are slow these days and can take up to 3 minutes`

        console.log(`Flutterwave said `, data)


    }


    /**
     * @override
     * @param {import("../../../types.js").PaymentRecord} record 
     * @returns {Promse<void>}
     */
    async refresh(record) {

        if (record.type === 'payout') { //TODO: Support payouts with flutterwave
            throw new Exception(`Payouts are not supported. The system cannot send money to another`, {
                code: 'error.system.unplanned'
            })
        }

        let reply = await this.client.Transaction.verify({
            id: record.provider_data.external_id
        })

        record.settled_amount = {
            value: reply.data?.status === 'successful' ? reply.data.amount : 0,
            currency: reply.data.currency
        }
        record.done = record.settled_amount.value >= record.amount.value


        if (reply.data) {

            if (reply.data.status === 'failed') {

                console.log(`payment failed `, reply.data)

                record.failed = {
                    reason: reply.data.processor_response,
                    time: Date.now()
                }
            }

            record.amount = {
                value: reply.data.amount,
                currency: reply.data.currency
            }
        }

        // console.log(reply, '\n', record)

    }




    /**
     * @override
     * 
     * @returns {Promise<import("../../../types.js").ProviderPaymentMethodsInfo>}
     */
    async getPaymentMethodsInfo() {
        return [
            {
                code: 'flutterwave.momo.mtn_momo',
                image: {
                    data: fs.readFileSync(libUrl.fileURLToPath(await import.meta.resolve(`./assets/mtn-momo-logo.png`))),
                    mimeType: 'image/png'
                },
                label: `MTN Mobile Money`
            },
            {
                code: 'flutterwave.momo.orange_money',
                label: `Orange Money`,
                image: {
                    data: fs.readFileSync(libUrl.fileURLToPath(await import.meta.resolve(`./assets/orange-money-logo.svg`))),
                    mimeType: 'image/svg+xml'
                },
            }
        ]
    }



    /**
     * This method returns the structure of form that the user will fill in to make an action
     * @param {object} param0
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @override
     * @returns {Promise<import('/$/system/static/lib/hc/multi-flex-form/types.js').MultiFlexFormDefinitionData>}
     */
    async getInlineFormDataStructure({ intent, method } = {}) {
        //Pretty easy, just phone number

        return [
            [
                {
                    label: 'Phone Number',
                    type: 'number',
                    name: 'phone_number'
                }
            ]
        ]
    }


    /**
     * Converts an amount in a foreign currency to the one supported by flutterwave
     * @param {import("../../../types.js").Amount} amount 
     */
    static async convertToWalletCurrency(amount) {


        if (amount.currency === this.wallet_currency) {
            return amount;
        }
        const Currencies = (await import('../../logic/currency.js')).Currencies //TODO: Implement real currency conversion

        return {
            value: await Currencies.convert(amount.value, amount.currency, this.wallet_currency),
            currency: this.wallet_currency
        }
    }

    static get wallet_currency() {
        return 'XAF'
    }



    static normalizePhone(phone) {
        phone = phone.replaceAll(/[^0-9]/g, '');

        if (!phone.startsWith('237')) {
            phone = `237${phone}`
        }
        return phone
    }


    static credential_fields = ['public_key', 'secret_key']

    static get client_credential_fields() {
        return []
    }



}