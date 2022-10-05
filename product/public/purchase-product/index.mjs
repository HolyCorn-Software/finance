/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This script controls the page on which users can purchase products
 */


import ProductDescription from './widgets/product-description/widget.mjs'
import InlinePaymentSettle from '/$/finance/payment/static/widgets/inline-payment-settle/debit.mjs'
import PaymentPage from '/$/finance/payment/static/widgets/payment-page/widget.mjs'
import finRpc from '/$/finance/static/lib/rpc/rpc.mjs'
import { handle, report_error_direct } from '/$/system/static/errors/error.mjs'
import { hc } from '/$/system/static/lib/hc/lib/index.js'


const page = new PaymentPage()

hc.importModuleCSS(import.meta.url)


document.body.appendChild(page.html)



const init = async () => {

    const id = new URLSearchParams(window.location.search).get('id')

    page.loadBlock()

    if (!id || id === '') {
        throw new Error(`Sorry, you probably clicked an invalid link.\nGo back to the page that directed you here, and try again.\nIf you still have the error, please report to us. We are ready to help`)
    }

    try {

        let debit_widget = new InlinePaymentSettle()



        const wrapper = hc.spawn({
            classes: ['wrapper'],
            children: [
                hc.spawn({
                    classes: ['container'],
                    children: [debit_widget.html]
                })
            ]
        })

        debit_widget.loadBlock();

        get_product_payment_id(id).then(payment_id => {

            debit_widget.state_data.payment_data.id = payment_id
        }).catch(handle).finally(() => {
            debit_widget.loadUnblock()
        })


        page.content.push(wrapper)

        finRpc.finance.product.data.getProduct({ id }).then((data) => {

            let description_widget = new ProductDescription(data)
            wrapper.prepend(description_widget.html)
        }).catch(e => {
            handle(e)
        })

    } catch (e) {
        handle(e)
    }
    setTimeout(() => page.loadUnblock(), 200)





}


/**
 * This method will either return a previous pending purchase or create a new one
 * @param {string} id 
 * @returns {Promise<string>}
 */
async function get_product_payment_id(id) {

    //This method should determine whether we should create a new payment or resume a previous one
    let pending = await finRpc.finance.product.purchase.getPendingPurchases({ product: id })

    return await new Promise(async (resolve, reject) => {

        if (pending.length === 0) {
            return resolve(await create_new())
        }

        /** @type {[import('../../purchase/types.js').PendingProductPurchase & {state: ('complete'|'pending')}]} */
        let eligible_purchases = []
        let nChecked = 0;

        for (let _pending_purchase of pending) {
            let pending_purchase = _pending_purchase

            // console.log(`pending_purchase: `, pending_purchase)

            if (!pending_purchase.payment || pending === null) {
                console.warn(`Ouch!, this purchase has no payment`)
                //Let's tell the server about it
                report_error_direct(new Error(`Unfortunately, this pending product purchase has no payment attached. Product: ${pending_purchase.product}, userid: ${pending_purchase.userid}`))
                nChecked += 1;
                if (nChecked === pending.length) {
                    done()
                }
                continue;

            }

            finRpc.finance.payment.getPublicData({ id: pending_purchase.payment }).then(public_data => {

                if (!public_data.failed?.reason) {

                    eligible_purchases.push({ ...pending_purchase, state: public_data.done ? 'complete' : 'pending' })

                }
                nChecked += 1;

                if (nChecked === pending.length) {
                    //Then we have checked all the pending product purchase records
                    done()
                }

            }).catch(e => {
                handle(e)
            })

        }

        async function done() {
            //Here, we check which payment (invoice) we'll finally select the payment to proceed with, or we create a new one
            if (eligible_purchases.length === 0) {
                return resolve(await create_new())
            }

            //If just one of the payments  (invoice) is done, then it becomes the choice
            let first_completed = eligible_purchases.filter(item => item.state === 'complete')[0]
            if (first_completed) {
                return resolve(first_completed.payment)
            }

            //Or we just take the first one
            return resolve(eligible_purchases[0].payment)
        }

        /**
         * This method creates a new payment (invoice) altogether
         * @returns {Promise<string>}
         */
        async function create_new() {
            return await finRpc.finance.product.purchase.purchase({ product: id, quantity: 1 })
        }

    });

}



init()