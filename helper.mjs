/**
 * Copyright 2022 HolyCorn Software
 * The Faculty of Finance
 * This module (helper) allows plugins to be retrieved with typing information
 */



/** @type {{list: import("system/lib/libFaculty/plugin/list.mjs").default<import("faculty/finance/types.js").FinancePluginNamespaceMap>}} */ 
const financePlugins = {}

Reflect.defineProperty(financePlugins, 'list', {
    get: () => FacultyPlatform.get().pluginManager.loaded,
    configurable: true,
    enumerable: true
})


export default financePlugins