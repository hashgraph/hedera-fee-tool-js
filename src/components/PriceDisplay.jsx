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

import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import Utils from "./Utils.js";

class PriceDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddToEstimatorButtonClick = this.handleAddToEstimatorButtonClick.bind(this);
  }

  handleAddToEstimatorButtonClick(event) {
    event.preventDefault();
    this.props.addToEstimatorButtonClickHandler();
  }

  formatPrice(val, currency) {
    if (currency === "h") {
      let ret = (val / this.props.exchangeRate) * 100;
      ret = Utils.truncateDecimal(ret, 6);
      return ret
    } else {
      return Utils.truncateDecimal(val, 4);
    }
  }

  render() {
    if ("isPriceValid" in this.props) {
      if (!this.props.isPriceValid) {
        return "";
      }
    }

    if (this.props.addToEstimatorButtonClickHandler === null) {
      return (
        <div className="price-container">
          <table className="table priceCartTable priceValueContainer estimate-total">
            <tbody>
            <tr>
              <td><h4 className="title-total">Total:</h4></td>
              <td></td>
              <td></td>
              <td>{this.usdPrice()}</td>
              <td></td>
              <td>{this.hbarPrice("priceValueHbar estimate-total")}</td>
              <td></td>
              <td></td>
            </tr>
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="price-container">
          <div className="priceValueContainer service-total" key={Math.random()}>
            <h4 className="title-service-total">API call estimate:</h4>
            {this.usdPrice()}
          </div>
          {this.hbarPrice("priceValueHbar")}
          <div className="addToCartDiv" key={Math.random()}>
            <button
              className="addToCartButton"
              onClick={this.handleAddToEstimatorButtonClick}
            >
            ADD TO TOTAL ESTIMATE
            </button>
          </div>
        </div>
      );
    }
  }

  usdPrice() {
    return (
      <div
        id={"priceElementsPriceValue" + this.props.totalPriceDivId}
        key={"priceElementsPriceValue" + this.props.totalPriceDivId}
        className="priceValue"
      >
        {this.formatPrice(this.props.priceValue, "USD")}
      </div>
    );
  }

  hbarPrice(classNames) {
    return (
      <div
        id={"priceElementsPriceValueHbar" + this.props.totalPriceDivId}
        key={"priceElementsPriceValueHbar" + this.props.totalPriceDivId}
        className={classNames}
      >
        {String(this.formatPrice(this.props.priceValue, "h"))}
      </div>
    );
  }
}

export default PriceDisplay;
