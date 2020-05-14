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

class Coefficients {
  constructor(numNodes, constantTermWeight) {
    this.capacities = capacities;
    this.coefficients = {
      node: {},
      network: {},
      service: {}
    };

    Object.entries(this.capacities).forEach(([key, val]) => {
      this.coefficients.node[key] = math.eval(1.0 / val);
      this.coefficients.network[key] = math.eval((1.0 * numNodes) / val);
      this.coefficients.service[key] = math.eval((1.0 * numNodes) / val);
    });

    // Calculate the constant term
    Object.entries(this.coefficients).forEach(([row, rowVals]) => {
      let sum = 0.0;
      this.coefficients[row]["constant"] = 0;
      Object.entries(rowVals).forEach(([key, val]) => {
        sum += val;
      });
      this.coefficients[row]["constant"] = math.eval(
        sum / (1 / constantTermWeight - 1)
      );
    });
  }

  getCoefficients() {
    return this.coefficients;
  }
}

export default Coefficients;
