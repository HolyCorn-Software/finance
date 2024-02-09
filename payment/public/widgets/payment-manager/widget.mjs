/**
 * Copyright 2023 HolyCorn Software
 * The Faculty of Finance
 * This widget allows an authorized personnel to manage payment transactions 
 */


import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import SlideIn from "/$/system/static/html-hc/widgets/slidein/widget.mjs";
import ListDataManager from "/$/system/static/html-hc/widgets/list-data-manager/widget.mjs";
import soulMan from "/$/system/static/lib.mjs"
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";

const paymentMethods = Symbol()
const profiles = Symbol()

const session = Symbol()

const externalActions = Symbol()


/**
 * @extends ListDataManager<finance.payment.PaymentRecord>
 */
export default class PaymentManager extends ListDataManager {

    constructor() {


        super(
            {
                title: `Payments`,
                config: {
                    fetch: async () => {
                        this[session] = await hcRpc.finance.payment.getRecords();
                        const profilesChange = new DelayedAction(() => this.dispatchEvent(new CustomEvent('profiles-change')), 250, 1000)
                        this[session].profiles().then(async profileStream => {
                            for await (let profile of profileStream) {
                                this[profiles].push(profile)
                                profilesChange()
                            }
                        })

                        return this[session].data()
                    },
                    display: [

                        {
                            label: `ID`,
                            name: 'id',
                            view: '::text'
                        },
                        {
                            label: `User`,
                            view: async data => {
                                const owner = data?.[0]
                                let profile;

                                const checkProfile = () => {
                                    profile = this[profiles].find(item => item.id == owner);
                                    return (typeof profile) != 'undefined'
                                }

                                if (!checkProfile()) {
                                    await new Promise(resolve => {
                                        let done;

                                        const onChange = () => {
                                            if (checkProfile()) {
                                                this.removeEventListener('profiles-change', onChange)
                                                resolve()
                                                done = true
                                            }

                                        }

                                        this.addEventListener('profiles-change', onChange)

                                        // TODO: Limit the wait, and directly search the profile after a given time period
                                    })
                                }
                                return new InlineUserProfile(profile).html
                            },
                            name: 'owners',
                        },
                        {
                            label: `Amount`,
                            name: 'amount',
                            view: (input) => hc.spawn({ innerHTML: `${input?.value} ${input?.currency}` })
                        },
                        {
                            label: `Payment Method`,
                            view: async (input) => {
                                const fetchNew = async () => {
                                    console.log(`Fetching new payment methods info `)
                                    await (paymentMethodsPromise = (async () => {
                                        this[paymentMethods] = await hcRpc.finance.payment.getPaymentMethods();
                                    })())
                                }

                                try {
                                    if (!paymentMethodsPromise) {
                                        await fetchNew()
                                    } else {
                                        await paymentMethodsPromise
                                    }
                                } catch {
                                    await fetchNew()
                                }

                                const method = this[paymentMethods].find(x => x.code == input);
                                if (!method) {
                                    return input
                                }
                                return hc.spawn(
                                    {
                                        classes: ['hc-finance-payment-manager-entry-payment-method'],
                                        innerHTML: `
                                            <div class='container'>
                                                <img src='${method.image}'>
                                                <div class='label'>${method.label}</div>
                                            </div>
                                        `
                                    }
                                )
                            },
                            name: 'method'
                        },
                        {
                            label: `Date`,
                            view: (input) => {
                                return new Date(input).toString()
                            },
                            name: 'created',
                        },
                        {
                            label: `Status`,
                            name: 'failed',
                            view: (input, superdata) => {
                                return hc.spawn(
                                    {
                                        innerHTML: superdata.failed ? `Failed` : superdata.done ? `Complete` : `Pending`
                                    }
                                )
                            }
                        }
                    ],
                    actions: (input) => {
                        let externalActionsPlaceholder = new Widget();
                        externalActionsPlaceholder.html = hc.spawn(
                            {
                                classes: [PaymentManager.classList[0] + '-external-actions-placeholder']
                            }
                        );


                        externalActionsPlaceholder.blockWithAction(async () => {
                            await Promise.allSettled(
                                this[externalActions].map(async ext => {
                                    for (const item of await ext.callback(input)) {
                                        await externalActionsPlaceholder.waitTillDOMAttached()
                                        const parent = externalActionsPlaceholder.html.parentElement
                                        parent.appendChild(item)
                                    }
                                })
                            ).then(() => externalActionsPlaceholder.html.remove())
                        })

                        return [
                            externalActionsPlaceholder.html,
                            hc.spawn(
                                {
                                    tag: 'img',
                                    attributes: {
                                        src: new URL('./copy-link.svg', import.meta.url).href
                                    },
                                    onclick: () => {
                                        const url = `https://${new URL(window.location.href).host}/$/finance/payment/static/settle-payment/?id=${input.id}`
                                        let message = `Copied Link to clipboard`
                                        let timeout = 2500;
                                        try {
                                            window.navigator.clipboard.writeText(url)
                                        } catch {
                                            message = `Failed to copy to clipboard.\n<br>Use <a target=_blank href='${url}'>${url}</a>`
                                            timeout = 7500;
                                        }

                                        const slideIn = new SlideIn({
                                            content: hc.spawn({
                                                innerHTML: message
                                            })
                                        })
                                        slideIn.show()
                                        slideIn.dismiss(timeout)
                                    }

                                }
                            ),
                        ]
                    },
                    input: [
                        [
                            {
                                label: `Amount`,
                                name: 'amount_value',
                                type: 'number',
                                valueProperty: 'valueAsNumber'
                            },
                            {
                                label: `Currency`,
                                name: 'amount_currency',
                                type: 'customWidget',
                                customWidgetUrl: "/$/system/static/html-hc/widgets/binance-currency-input/widget.mjs",
                                value: 'XAF'
                            }
                        ],
                        [
                            {
                                label: `Type`,
                                name: 'type',
                                type: 'choose',
                                values: {
                                    invoice: 'Invoice',
                                    payout: 'Payout'
                                }
                            }
                        ],
                        [
                            {
                                label: `User`,
                                name: 'owner_0',
                                type: 'customWidget',
                                customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                                mode: "user"
                            }
                        ]
                    ],
                    create: async (input) => {

                        return await Promise.all(
                            input.map(async record => {
                                const transaction = {
                                    amount: {
                                        value: record.amount_value,
                                        currency: record.amount_currency || 'XAF'
                                    },
                                    type: record.type,
                                    owners: [record.owner_0.id],
                                };

                                transaction.id = await hcRpc.finance.payment.createRecord(transaction)
                                transaction.created = Date.now()
                                return transaction
                            })
                        )
                    },

                }
            }
        );


        /** @type {modernuser.profile.UserProfileData[]} */
        this[profiles] = []

        /** @type {finance.ui.payment_manager.ExternalAction[]} */
        this[externalActions] = []

        this.html.classList.add(...PaymentManager.classList)

        let paymentMethodsPromise;

        this.blockWithAction(async () => {
            await soulMan.run.addScope('hc-finance-payment-manager')
        })

    }

    /**
     * This method is designed for external sources to call, in order to add additional features to the widget.
     * 
     * The parameter you pass contains a function that would be invoked when the user wants to take action on a payment record.
     * 
     * The function should return an array of HTMLElements, that would be displayed on the options menu.
     * @param {finance.ui.payment_manager.ExternalAction} action 
     * 
     */
    addExternalAction(action) {
        this[externalActions] = [
            ...this[externalActions].filter(x => x.name !== action.name),
            action
        ]
    }

    /** @readonly */
    static get classList() {
        return ['hc-finance-payment-manager']
    }

}


hc.importModuleCSS(import.meta.url)