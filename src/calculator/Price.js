/*-
 * ‌
 * Hedera Fee Tool
 * ​
 * Copyright (C) 2019 - 2020 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import * as math from 'mathjs';

import externalPrices from '../resources/ExternalPrices.json';
import Coefficients from './Coefficients';
const constants = require('../resources/Constants.json');
const usageParamProperties = require('../resources/usageParams.json');

class Price {
    generatedPriceList = {};
    desiredPriceList = {};

    constructor(numNodes, constantTermWeight, apis) {
        this.numNodes = numNodes;
        this.constantTermWeight = constantTermWeight;
        this.model = {
            NUM_NODES: numNodes,
            CONST_TERM_WEIGHT: constantTermWeight,
            PRICE_PRECISION: 5,
            FEE_SCHEDULE_MULTIPLIER: 1000,
            USD_TO_TINYCENTS: 10000000000
        };

        this.constantsMap = {};
        Object.entries(constants).forEach(([constVar, constVal]) => {
            this.constantsMap[constVar] = constVal;
        });
        this.initializeDesiredPriceList(apis);
        this.generateFeeSchedules(apis);
        this.analyzeVariables(apis, 25);
        this.generatePriceList(apis);
    }

    getGeneratedPriceList() {
        return this.generatedPriceList;
    }

    initializeDesiredPriceList(apis) {
        const INFINITESIMALLY_SMALL_PRICE = 0.00000001;
        // Since the HAPI implementation charges a separate CyrptoTransfer fees (of 0.0001) to
        // every query, subtract the crypto transfer fees from the query fees
        let cryptoTransferDeltaForQueries = externalPrices['Crypto']['CryptoTransfer'];
        Object.entries(externalPrices).forEach(([service, serviceApis]) => {
            Object.entries(serviceApis).forEach(([api, desiredPrice]) => {
                this.desiredPriceList[api] = externalPrices[service][api];
                if (apis[api].type === "query") {
                    this.desiredPriceList[api] -= cryptoTransferDeltaForQueries;
                    if (this.desiredPriceList[api] <= 0) {
                        this.desiredPriceList[api] = INFINITESIMALLY_SMALL_PRICE;
                    }
                }
            });
        });
    }

    newFeeComponents() {
        return ({constant: 1, bpt: 0, vpt: 0, rbh: 0, sbh: 0, gas: 0, bpr: 0, sbpr: 0 });
    }

    newFeeData() {
        return ({
            node: this.newFeeComponents(),
            network: this.newFeeComponents(),
            service: this.newFeeComponents(),
        });
    }

    calculateUsage(apiParams) {
        let usage = this.newFeeData();
        if (apiParams.status === "incomplete" || apiParams.formulae === null) {
            return usage;
        }
        // Populate formulaVals with usage values
        let formulaVals = Object.assign({}, this.constantsMap);
        Object.entries(apiParams.usage).forEach(([feeVar, feeVal]) => {
            if ((feeVal === true) || (feeVal === false)) {
                formulaVals[feeVar] = (feeVal) ? 1 : 0;
            } else {
                formulaVals[feeVar] = feeVal;
            }
        });

        // Evaluate formulaes to compute usage
        Object.entries(apiParams.formulae).forEach(([feeComponent, items]) => {
            Object.entries(items).forEach(([item, formula]) => {
                let compiledFormula = math.parse(formula).compile();
                usage[feeComponent][item] = compiledFormula.eval(formulaVals);
                // console.log (item + " = " + usage[feeComponent][item]);
            });
        });

        // Fix put in to make the query calculations match the price calculated by the actual code
        // For queries, if the network and service components are all 0, then make the constant also 0
        if (apiParams.type === 'query') {
            for (let feeReceiver of ["network", "service"]) {
                let sum = 0;
                // console.log(usage[feeReceiver]);
                for (let feeComponent of Object.keys(usage[feeReceiver])) {
                    if (feeComponent !== 'constant') {
                        sum += usage[feeReceiver][feeComponent];
                    }
                }
                if (sum === 0) {
                    usage[feeReceiver]['constant'] = 0;
                }
            }
        }
        return usage;
    }

    generatePriceList(apis) {
        let priceList = {};
        Object.entries(apis).forEach(([api, apiParams]) => {
            const base = this.calculatePrice(api, apiParams).price;
            priceList[api] = {
                price: base,
                usage: JSON.parse(JSON.stringify(apiParams.usage))
            }
        });
        this.generatedPriceList = priceList;
        console.log("PriceList generated: ", priceList);
    }

    analyzeVariables(apis, minLimit) {
        Object.entries(apis).forEach(([api, apiParams]) => {
            let relevantUsage = {};
            const basePrice = this.calculatePrice(api, apiParams).price;
            Object.entries(apiParams.usage).forEach(([apiUsageParam, paramValue]) => {
                relevantUsage[apiUsageParam] = {};
                // Deep copy to not modify the instance in 'apis'.
                let customUsage = JSON.parse(JSON.stringify(apiParams.usage));
                let calcUsage = (name, value) => {
                    customUsage[apiUsageParam] = value;
                    const price = this.calculatePrice(api, apiParams, customUsage).price;
                    relevantUsage[apiUsageParam][name] = {
                        'value': value,
                        'price': price,
                        'diff': ((price - basePrice) / basePrice) * 100
                    };
                };
                calcUsage('base', apiParams.usage[apiUsageParam]);
                calcUsage('min', usageParamProperties[apiUsageParam].min);
                calcUsage('max', usageParamProperties[apiUsageParam].max);
                // console.log ("Price range: " + relevantUsage);
                const priceRangePercentage = relevantUsage[apiUsageParam]['max'].diff - relevantUsage[apiUsageParam]['min'].diff;
                relevantUsage[apiUsageParam]['isRelevant'] = priceRangePercentage >= minLimit;
            });
            apis[api]['relevantUsage'] = relevantUsage;
        });
    }

    sumProduct(a, b) {
        let sum = 0;
        Object.entries(a).forEach(([key, val]) => {
            Object.entries(val).forEach(([subKey, subVal]) => {
                sum = math.eval(sum + (a[key][subKey] * b[key][subKey]));
            });
        });
        return sum;
    }

    // apiParams are not modified
    calculatePrice(api, apiParams, customUsage) {
        // console.log("CalculatePrice: API: ", api);
        const ARTIFICIAL_HIGH_MULTIPLIER_RBH = 16910000;
        const ARTIFICIAL_HIGH_MULTIPLIER_SBH = 237258000;
        // Deep copy since we modify the instance below
        let customApiParams = JSON.parse(JSON.stringify(apiParams));
        if (customUsage !== undefined && customUsage !== null) {
            customApiParams.usage = customUsage;
        }
        // Skip incomplete APIs
        if (customApiParams.status === "incomplete") {
            return 0;
        }
        let actualUsage = this.calculateUsage(customApiParams);
        // Artificially increase the prices for crypto transfer records
        if (api === 'cryptoTransfer') {
            if (customApiParams.usage.requestedRecord) {
                actualUsage.service.rbh = math.eval(actualUsage.service.rbh * ARTIFICIAL_HIGH_MULTIPLIER_RBH);
            }
            if (customApiParams.usage.numThresholdRecords > 0) {
                actualUsage.service.sbh = math.eval(actualUsage.service.sbh * ARTIFICIAL_HIGH_MULTIPLIER_SBH);
            }
        }
        // console.log("CalculatePrice: actual usage:\n", actualUsage);
        this.normalizedPrice = math.eval(
            this.sumProduct(this.feeSchedules[api], actualUsage) /
            (this.model.FEE_SCHEDULE_MULTIPLIER * this.model.USD_TO_TINYCENTS)
        );
        // For queries, add the price of cryptotransfer back to the normalized price
        if (customApiParams.type === 'query' && api !== 'CryptoGetAccountBalance') {
            this.normalizedPrice += this.desiredPriceList['CryptoTransfer'];
        }
        // console.log("Query-adjusted Normalized Price: " + this.normalizedPrice);
        return ({
            usage: actualUsage,
            price: this.normalizedPrice.toFixed(this.model.PRICE_PRECISION)
        });
    }

    generateFeeSchedules(apis) {
        console.log("Generating fee schedules");
        this.feeSchedules = {};

        // Initialize the Unnormalized Coefficients
        let unnormalizedCoefficients = new Coefficients(
            this.numNodes, this.constantTermWeight).getCoefficients();

        // Now calculate the fee schedules for each API
        Object.entries(apis).forEach(([api, apiParams]) => {
            if (apiParams.status === "incomplete") {
                return;
            }
            if (Object.keys(apiParams.usage).length === 0) {
                console.log("Found Empty API: ", api, apiParams);
                this.feeSchedules[api] = this.newFeeData();
                return;
            }
            let expectedUsage = this.calculateUsage(apiParams);
            console.log("Expected usage ", expectedUsage);
            let unnormalizedPrice = this.sumProduct(unnormalizedCoefficients, expectedUsage);
            //console.log("Unnormalized Price: " + unnormalizedPrice);
            if (isNaN(unnormalizedPrice)) {
                this.feeSchedules[api] = this.newFeeData();
                return;
            }

            console.log(this.desiredPriceList[api]);
            // Calculate the fee schedule (i.e. Normalized Coefficients)
            this.feeSchedules[api] = {};
            Object.entries(unnormalizedCoefficients).forEach(([key, val]) => {
                this.feeSchedules[api][key] = {};
                Object.entries(val).forEach(([subKey, subVal]) => {
                    this.feeSchedules[api][key][subKey] = Math.round(
                      math.eval(
                        this.model.FEE_SCHEDULE_MULTIPLIER *
                        (this.desiredPriceList[api]/ unnormalizedPrice) *
                        this.model.USD_TO_TINYCENTS * subVal
                      )
                    );
                });
            });
        });
        console.log("Fee schedules generated");
        console.log(JSON.stringify(this.feeSchedules, null, '\t'));
    }
}

export default Price;
