/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module organizes all the collections used by the faculty into one
 */

import { CollectionProxy } from "../../system/database/collection-proxy.js";



/**
 * @type {{
 *     payment_provider_credentials: import("./payment/types.js").PaymentProviderCredentialsCollection,
 *     hot_payment_records: import("./payment/types.js").PaymentRecordCollection,
 *     middle_payment_records: import("./payment/types.js").PaymentRecordCollection,
 *     archive_payment_records: import("./payment/types.js").PaymentRecordCollection,
 *     product_data: finance.product.data.ProductDataCollection,
 *     product_purchase: finance.product.purchase.ProductPurchaseCollection,
 *     account_info: finance.accounts.info.AccountInfoCollection,
 *     account_pending_transactions: finance.accounts.info.PendingTransactionsCollection
 * }}
 */
const collections = new CollectionProxy(
    {
        'payment_provider_credentials': 'payment.providers.credentials',
        'hot_payment_records': 'payment.records.hot',
        'middle_payment_records': 'payment.records.middle',
        'archive_payment_records': 'payment.records.archive',
        'product_data': 'product.data',
        'product_purchase': 'product.purchase',
        'account_topup': 'accounts.topup.transactions',
        'account_info': 'accounts.info',
        'account_pending_transactions': 'accounts.transactions.pending'
    }
)


export default collections