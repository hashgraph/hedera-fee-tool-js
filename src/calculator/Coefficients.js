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

import * as math from "mathjs";
import capacities from "../resources/Capacities.json";
import constWeights from '../resources/ConstantWeights.json';

class Coefficients {
  constructor(numNodes) {
    this.capacities = capacities;
    this.coefficients = {
      node: {},
      network: {},
      service: {}
    };
    // Compute the generic coefficients
    Object.entries(this.capacities).forEach(([key, val]) => {
      this.coefficients.node[key] = math.eval(1.0 / val);
      this.coefficients.network[key] = math.eval((1.0 * numNodes) / val);
      this.coefficients.service[key] = math.eval((1.0 * numNodes) / val);
    });

    let apiConstantWeights = {}; 
    Object.entries(constWeights).forEach(([service, apiWeights]) => {
      Object.entries(apiWeights).forEach(([api, constWeight]) => {
        apiConstantWeights[api] = constWeight;
      });
    });

    this.apiProviderConstants = { 
      node: {},
      network: {},
      service: {}
    };

    // Calculate constant terms for each api by provider (node/network/service)
    Object.entries(apiConstantWeights).forEach(([api, constWeight]) => {
      Object.entries(this.coefficients).forEach(([provider, terms]) => {
        let sum = 0.0;
        this.coefficients[provider]["constant"] = 0;
        Object.entries(terms).forEach(([term, value]) => {
          sum += value;
        });
        this.apiProviderConstants[provider][api] = math.eval(
          sum / (1 / apiConstantWeights[api] - 1)
        );
      });
    });
  }

  getCoefficients(api) {
    let apiCoefficients = {
      node: {
        ...this.coefficients["node"],
        constant: this.apiProviderConstants["node"][api]
      },
      network: {
        ...this.coefficients["network"],
        constant: this.apiProviderConstants["network"][api]
      },
      service: {
        ...this.coefficients["service"],
        constant: this.apiProviderConstants["service"][api]
      }
    };
    return apiCoefficients;
  }
}

export default Coefficients;
