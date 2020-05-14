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
import {
  FormControl,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import Utils from "./Utils.js";

class EstimatorCartDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.handlePriceCartUpdate = this.handlePriceCartUpdate.bind(this);
  }

  handlePriceCartUpdate(e) {
    const index = e.target.id.replace("priceCartFormQuantity_", "");
    let val = Number(e.target.value);

    if(val === 0) {
      val = 1;
    } else if(val < 0) {
      val *= -1;
    }

    if (e.target.value.length > e.target.maxLength) {
      val = e.target.value.slice(0, e.target.maxLength);
    }
    e.target.value = val;

    this.props.estimatorCart.updateQuantity(index, val);
    this.props.context.setState(this.props.context.state);
  }

  handlePriceCartDelete(e) {
    var buttonIndex = e.target.id.replace("priceCartFormDeleteButton_", "");
    this.props.estimatorCart.removeEstimate(buttonIndex);
    this.props.context.setState(this.props.context.state);
  }

  createTable(estimatorCart) {
    if (
      estimatorCart === undefined ||
      estimatorCart === null ||
      Object.keys(estimatorCart.lineItems).length === 0
    ) {
      return null;
    }
    let children = [];
    Object.entries(estimatorCart.getLineItems()).forEach(([ key, priceItem ]) => {
      const index = priceItem.index;
      children.push(
        <tr key={"priceItem_" + index}>
          <td id={"priceCartFormItemOperation_" + index}>
            {priceItem.api}
          </td>
          <td>
            <FormControl
              aria-label="Large"
              defaultValue={priceItem.quantity}
              onChange={this.handlePriceCartUpdate}
              className="priceCartItemInput"
              key={"priceCartFormQuantity_" + index}
              id={"priceCartFormQuantity_" + index}
              data={priceItem.index}
              max="999999"
              min="0"
              maxLength="6"
              type="number"
            />
          </td>
          <td id={"priceCartFormItemPrice_" + index}>
            {Utils.truncateDecimal(priceItem.unitPrice, 4)}
          </td>
          <td id={"priceCartFormItemRowPrice_" + index} className="priceCartFormItemRowPrice">
            {Utils.truncateDecimal(priceItem.linePrice, 4)}
          </td>
          <td className="priceCartSpacer1"></td>
          <td id={"priceCartFormItemRowPriceH_" + index} className="priceCartFormItemRowPriceH">
            {Utils.truncateDecimal(((priceItem.linePrice / this.props.exchangeRate)*100), 6)}
          </td>
          <td className="priceCartSpacer2"></td>
          <td>
            <Button
              variant="light"
              id={"priceCartFormDeleteButton_" + index}
              className="btn-delete"
              onClick={this.handlePriceCartDelete}
              data={priceItem.index}
            >
              X
            </Button>
          </td>
        </tr>
      );
    });

    return (
      <div key="priceCartTable" className="priceCartTableDiv">
        <table className="table priceCartTable">
          <thead>
          <tr key={"priceCart_table_head"}>
            <th>Network API</th>
            <th># of<br/>API calls</th>
            <th>Fee per<br/>API call</th>
            <th>USD</th>
            <th></th>
            <th>ℏ</th>
            <th></th>
            <th></th>
          </tr>
          </thead>
          <tbody key={"priceCartTable_tbody_"}>{children}</tbody>
        </table>
      </div>
    );
  }

  render() {
    if (this.props.estimatorCart.getNumItems() === 0) {
      // empty cart
      return (
        <div className="emptyMessageDiv">
          <h2 className="two-line-title">
            <span>Your</span>
            Total estimate
          </h2>
        </div>
      );
    } else {
      return (
        <div>
          <h2 className="two-line-title">
            <span>Your</span>
            Total estimate
          </h2>
          {this.createTable(this.props.estimatorCart)}
        </div>
      );
    }
  }
}

export default EstimatorCartDisplay;
