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

class PriceDetails extends React.Component {
  createTableHeader(usage) {
    if (usage === undefined || usage === null) {
      return;
    }
    return <div id="detailed-usage-header">Usage Breakdown</div>;
  }

  createTable(usage) {
    let tablesArr = [];

    console.log("Detailed usage: ");
    console.log(usage);
    if (usage === undefined || usage === null) {
      return;
    }

    Object.entries(usage).forEach(([usageType, usageValue]) => {
      let table = [];
      let headers = [];
      let children = [];
      Object.entries(usageValue).forEach(([subUsageType, subUsageValue]) => {
        var keyPrefix = usageType + "_" + subUsageType + "_";
        headers.push(<th key={keyPrefix + "th"}>{subUsageType}</th>);
        children.push(<td key={keyPrefix + "td"}>{subUsageValue}</td>);
      });
      table.push(
        <thead key={"subUsage_thead_" + usageType}>
          <tr key={usageType + "_table_head"}>{headers}</tr>
        </thead>
      );
      table.push(
        <tbody key={"subUsage_tbody_" + usageType}>
          <tr key={usageType + "_table_child"}>{children}</tr>
        </tbody>
      );
      tablesArr.push(
        <div key={"subUsage_" + usageType}>
          <div className="subUsageTitle">{usageType}</div>
          <table className="table table-striped subUsageTable">{table}</table>
        </div>
      );
    });

    return tablesArr;
  }

  render() {
    //var price = this.props.price;
    return (
      <div>
        {this.createTableHeader(this.props.usage)}
        {this.createTable(this.props.usage)}
      </div>
    );
  }
}

export default PriceDetails;
