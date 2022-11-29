/**
 * Copyright 2022 HolyCorn Software
 * The Matazm Project
 * This module (types) contains type definitions for the BinancePay payment provider
 */



export interface BinancePayCredentials {

    keyId: string
    secretKey: string

}


namespace BinancePayTypes {

    interface ChargeResponse {
        status: ("SUCCESS" | "FAIL")
        code: string
        data: {
            prepayId: string
            terminalType: TerminalType
            expireTime: number
            qrcodeLink: string
            qrContent: string
            checkoutUrl: string
            deeplink: string
            universalUrl: string
        },
        errorMessage: string
    }



    interface ChargeRequest {
        env: {
            terminalType: TerminalType
        },
        merchantTradeNo: string
        orderAmount: number
        currency: string
        goods: {
            goodsType: GoodsType
            goodsCategory: GoodsCategory
            referenceGoodsId: string
            goodsName: string
            goodsDetail: string
        }
    }



    type TerminalType = ("APP" | "MINI_PROGRAM" | "WEB" | "WAP" | "OTHERS")
    type GoodsType = ("01" | "02")
    type GoodsCategory =
        "0000" |// Electronics & Computers
        "1000" |// Books, Music & Movies
        "2000" |// Home, Garden & Tools
        "3000" |// Clothes, Shoes & Bags
        "4000" |// Toys, Kids & Baby
        "5000" |// Automotive & Accessories
        "6000" |// Game & Recharge
        "7000" |// Entertainament & Collection
        "8000" |// Jewelry
        "9000" |// Domestic service
        "A000" |// Beauty care
        "B000" |// Pharmacy
        "C000" |// Sports & Outdoors
        "D000" |// Food, Grocery & Health products
        "E000" |// Pet supplies
        "F000" |// Industry & Science
        "Z000" // Others


    interface ChargeStatus {
        status: ("SUCCESS" | "FAIL")
        code: string
        data: {
            merchantId: number
            prepayId: string
            transactionId: string
            merchantTradeNo: string
            status: "INITIAL" | "PENDING" | "PAID" | "CANCELED" | "ERROR" | "REFUNDING" | "REFUNDED" | "EXPIRED"
            currency: string
            orderAmount: number
            openUserId: string
            passThroughInfo: string
            transactTime: number
            createTime: number
        }
        errorMessage: string
    }
}