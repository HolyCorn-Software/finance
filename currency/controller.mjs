/*
Copyright 2022 HolyCorn Software
The Matazm Project
Adapted from The BGI Swap Project
This module offers currency conversion, and rates, and info

*/

import fetch from 'node-fetch'


export class CurrencyController {

    constructor() {

    }


    /**
     * Get the exchange rates, relative to a named currency
     * @param {string} base The reference currency. By default, the base_currency is used
     * @returns {Object<string, number>}
     */
    async rates(base) {

        base ||= 'XAF'

        const data = (await (await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${base}`)).json()).data?.rates
        if (data) {
            for (let key in data) {
                data[key] = new Number(data[key]).valueOf()
            }
        }
        return data;

    }


    /**
     * Converts money from one currency to another
     * @param {number} value 
     * @param {string} from 
     * @param {string} to 
     * @returns {Promise<number>}
     */
    async convert(value, from, to) {
        let rates = (await this.rates()); //rates are in the base currency
        for(const property of [from, to]){
            if(!rates[property]){
                throw new Exception(`The currency '${property}' was not found`)
            }
        }
        let from_to_rate = rates[from] / rates[to];
        return new Number(value).valueOf() / from_to_rate;

    }

}
