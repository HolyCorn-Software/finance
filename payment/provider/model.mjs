/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This is the model to be followed by all payment providers
 */

import { BaseModel } from "../../../../system/lib/libFaculty/provider-driver.js";


export default class PaymentProviderModel extends BaseModel {




    /**
     * The system calls this method on the Payment provider to initialize it
     */
    async init() {

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
     * NOTE! The provider should store in the 'provider_data' field, the minimum data that can be used to retrieve information of the transaction on the provider's gateway.
     * 
     * For example, if a provider is paypal, it should store just what it needs to pull information from paypal.
     * 
     * The reason is because, this field will be used by the system for intergrity checks.
     * 
     * The provider can modify all fields of the record, but is advised to modify only what is necessary.
     * @param {import("../types.js").PaymentRecord} record 
     * @returns {Promise<void>}
     */
    async charge(record) {

    }

    /**
     * The system calls this method when it requests that the wallet transfers an amount of money to a given destination, within the capability of the wallet.
     * 
     * The method is async, and manipulates the Payout data directly to make changes
     * @param {import("../types.js").PaymentRecord} payout The information of where and how much to pay
     * @returns {Promise<void>}
     */
    async payout(payout) {

    }

    /**
     * The system calls this method on the provider when it wants to refresh the state of a transaction.
     * 
     * The provider therefore queries external sources to validate how much has been paid concerning the particular transaction as well as any errors that may have happened.
     * 
     * The provider should modify the necessary fields (e.g amount, expiry, done) according to the new state of the transaction.
     * 
     * Providers should have nothing to do with the lastRefresh field
     * @param {import("../types.js").PaymentRecord} record 
     * @returns {Promise<void>}
     */
    async refresh(record) {


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
     * @param {import("./types.js").PaymentUserInput} paymentData
     * @returns {Promise<import("../types.js").PaymentUserInputValidationResult>}
     */
    async validateUserInput(paymentData) {

    }

    /**
     * This method is called by the system when determining if a payment method should be handled by a wallet
     * The provider returns true or false depending on whether it supports the named payment method
     * @param {string} paymentMethod 
     * @param {Promise<boolean>}
     */
    async matchProvider(paymentMethod) {

    }
    /**
     * This method is called by the system in order to get the list of payment methods supported by this provider
     * 
     * @returns {Promise<import('../types.js').ProviderPaymentMethodsInfo>}
     */
    async getPaymentMethodsInfo() {

    }

    /**
     * Providers should override this method so as to provide public clients with a form that can be filled when entering details for an invoice or payout
     * @param {object} param0
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @returns {Promise<import("/$/system/static/lib/hc/multi-flex-form/types.js").MultiFlexFormDefinitionData}
     */
    async getInlineFormDataStructure({ intent, method }) {

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