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

class Relevancy extends React.Component {

  render() {
    let children = [];
    Object.entries(this.props.apis).forEach(([api, apiParams]) => {
      Object.entries(apiParams.relevantUsage).forEach(([usageParam, paramValue]) => {
        children.push(
          <tr key={api + "_" + usageParam}>
            <td>{api}</td>
            <td>{usageParam}</td>
            <td>{"" + paramValue.base.value}</td>
            <td>{paramValue.base.price}</td>
            <td>{"" + paramValue.min.value}</td>
            <td>{paramValue.min.price}</td>
            <td>{paramValue.min.diff.toFixed(0)}</td>
            <td>{"" + paramValue.max.value}</td>
            <td>{paramValue.max.price}</td>
            <td>{paramValue.max.diff.toFixed(0)}</td>
            <td>{paramValue.isRelevant ? "Yes": "No"}</td>
          </tr>);
      });
    });
    return (
      <div>
        <div id="detailed-usage-header">Analysis of which parameters affect the value</div>
        <div>
          <table className="table table-striped relavancyTable">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Parameter</th>
                <th>Base value</th>
                <th>Base price</th>
                <th>Min value</th>
                <th>Price @ min value</th>
                <th>Difference (%)</th>
                <th>Max value</th>
                <th>Price @ max value</th>
                <th>Difference (%)</th>
                <th>Relevant?</th>
              </tr>
            </thead>
            <tbody>
              {children}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Relevancy;
