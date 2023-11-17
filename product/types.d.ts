/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product module
 * This module (types) contains type definitions used by it's parent module (product)
 */



import ''

global {

    namespace finance.product {
        interface ProductCollections {
            data: finance.product.data.ProductDataCollection
            purchase: finance.product.data.ProductPurchaseCollection

        }
    }
}