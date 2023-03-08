/**
 * Copyright 2022 HolyCorn Software
 * The Matazm Project
 * This module contains a pattern payment plugins are expected to follow
 */

import PaymentPluginSystemInterface from "./system.mjs"


const system = Symbol()

/**
 * @template CredentialsData
 * @template ProviderData
 * @template ClientInputData
 * @template ClientOutputData
 * @extends PluginModelModel<CredentialsData,ProviderData,ClientInputData,ClientOutputData>
 */
export default class PaymentPlugin extends PluginModelModel {



    constructor() {
        super()
    }

    /**
     * Plugins may make use of this interface to enjoy additional features
     */
    get system() {
        if (!this[system]) {
            this[system] = new PaymentPluginSystemInterface()
        }
        return this[system]
    }

    /**
     * This method is called by the system on a wallet when it wants to collect money from a customer.
     * 
     * That is, charging the customer.
     * 
     * This method is asynchronous and should make changes directly to the record
     * 
     * It's advisable to leave a custom user message in the invoice.client_data.output.message field.
     * 
     * This message will be shown to client after the action of debit.
     * 
     * NOTE! The plugin should store in the 'provider_data' field, the minimum data that can be used to retrieve information of the transaction on the plugin's gateway.
     * 
     * For example, if a plugin is paypal, it should store just what it needs to pull information from paypal.
     * 
     * The reason is because, this field will be used by the system for intergrity checks.
     * 
     * The plugin can modify all fields of the record, but is advised to modify only what is necessary.
     * 
     * If the plugin throws an error, it should add a field 'fatal' true to the error, if it deems it impossible to retry the same transaction
     * 
     * @param {Finance.Payment.PaymentRecord<ProviderData, ClientInputData, ClientOutputData>} record 
     * @returns {Promise<void>}
     */
    async charge(record) {
    }

    /**
     * The system calls this method when it requests that the wallet transfers an amount of money to a given destination, within the capability of the wallet.
     * 
     * The method is async, and manipulates the Payout data directly to make changes
     * @param {Finance.Payment.PaymentRecord<ProviderData, ClientInputData, ClientOutputData>} payout The information of where and how much to pay
     * @returns {Promise<void>}
     */
    async payout(payout) {

    }

    /**
     * The system calls this method on the plugin when it wants to refresh the state of a transaction.
     * 
     * The plugin therefore queries external sources to validate how much has been paid concerning the particular transaction as well as any errors that may have happened.
     * 
     * The plugin should modify the necessary fields (e.g amount, expiry, done) according to the new state of the transaction.
     * 
     * plugins should have nothing to do with the lastRefresh field
     * @param {Finance.Payment.PaymentRecord<ProviderData, ClientInputData, ClientOutputData>} record 
     * @returns {Promise<void>}
     */
    async refresh(record) {


    }

    /**
     * The system calls this method when it wants to check whether or not a given payment data is valid.
     * 
     * This payment data is usually entered by the user, and the data is usually used to charge the user
     * 
     * The plugin should not throw any exceptions, as it will be considered failure to validate.
     * 
     * Rather the plugins sets the sets the status to 'invalid'
     * 
     * Then set the reason why the payment data is wrong in 'message'
     * @param {Finance.Payment.PaymentUserInputValidationData<ClientInputData>} paymentData
     * @returns {Promise<Finance.Payment.PaymentUserInputValidationResult>}
     */
    async validateUserInput(paymentData) {

    }

    /**
     * This method is called by the system when determining if a payment method should be handled by a wallet
     * The plugin returns true or false depending on whether it supports the named payment method
     * @param {string} paymentMethod 
     * @param {Promise<number>}
     */
    async matchPlugin(paymentMethod) {

    }
    /**
     * This method is called by the system in order to get the list of payment methods supported by this plugin
     * 
     * @returns {Promise<Finance.Payment.PaymentMethodsInfo>}
     */
    async getPaymentMethodsInfo() {

    }

    /**
     * plugins should override this method so as to provide public clients with a form that can be filled when entering details for an invoice or payout
     * @param {object} param0
     * @param {Finance.Payment.PaymentRecordType} param0.intent
     * @param {string} param0.method
     * @returns {Promise<import("/$/system/static/html-hc/widgets/multi-flex-form/types.js").MultiFlexFormDefinitionData}
     */
    async getPaymentForm({ intent, method }) {

    }

}


global.PaymentPlugin = PaymentPlugin
