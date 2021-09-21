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

class EstimatorCart {
  constructor() {
    this.lineItems = {};
    this.totalPrice = 0;
    this.index = 1;
  }

  getTotalPrice() {
    return this.totalPrice;
  }

  getLineItems() {
    return this.lineItems;
  }

  getNumItems() {
    return Object.keys(this.lineItems).length;
  }

  calculateTotal() {
    let sum = 0;
    Object.entries(this.lineItems).forEach(function([key, val]) {
      sum = math.eval(sum + val.linePrice);
    });
    this.totalPrice = sum;
  }

  addEstimate(api, apiType, price, quantity) {
    this.lineItems[this.index] = {
      index: this.index,
      api: api,
      apiType: apiType,
      unitPrice: Number(price),
      quantity: quantity,
      linePrice: math.eval(Number(price) * quantity)
    };
    this.index++;
    this.calculateTotal();
  }

  removeEstimate(index) {
    if (this.lineItems.hasOwnProperty(index)) {
      delete this.lineItems[index];
    }
    this.calculateTotal();
  }

  updateQuantity(index, quantity) {
    if (this.lineItems.hasOwnProperty(index)) {
      this.lineItems[index].quantity = Number(quantity);
      this.lineItems[index].linePrice = math.eval(
        this.lineItems[index].unitPrice * Number(quantity)
      );
    }
    this.calculateTotal();
  }

  showEstimateCart() {
    JSON.stringify(this.lineItems);
  }
}

export default EstimatorCart;
