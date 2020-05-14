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
import {Button, Col, Collapse, Row} from "react-bootstrap";
import Relevancy from "./Relevancy";

class FeeSchedules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      feeScheduleDivOpen: false,
    };
  }

  createCurrentAndNextFeeSchedule() {
    let functionalityList = [];
    Object.entries(this.props.feeSchedules).forEach(([key, value]) => {
      functionalityList.push(
        {
          "transactionFeeSchedule": {
            "hederaFunctionality": key,
            "feeData": {
              "nodedata": Object.assign({}, value.node, {"min": 0, "max": 1000000000000000}),
              "networkdata": Object.assign({}, value.network, {"min": 0, "max": 1000000000000000}),
              "servicedata": Object.assign({}, value.service, {"min": 0, "max": 1000000000000000})
            }
          }
        }
      )
    });
    let oneYearInSeconds = 365 * 24 * 3600;
    let now = Math.floor(Date.now()/1000);
    return [{
      "currentFeeSchedule": [
        ...functionalityList,
        { "expiryTime": now + oneYearInSeconds }
      ]
    }, {
      "nextFeeSchedule": [
        ...functionalityList,
        { "expiryTime": now + 2 * oneYearInSeconds }
      ]
    }];
  }

  render() {
    return (
      <Row className="feeScheduleRow">
        <Col>
          <>
            <Button
              onClick={() => {
                this.state.feeScheduleDivOpen = !this.state.feeScheduleDivOpen;
                this.setState(this.state);
              }}
              aria-controls="feeScheduleDiv"
              aria-expanded={this.state.feeScheduleDivOpen}
              variant="outline-secondary"
            >
              Fee Schedule
            </Button>
            <Collapse in={this.state.feeScheduleDivOpen}>
              <div id="feeScheduleDiv">
                <Relevancy apis={this.props.apis}/>
                <br />
                <div id="feeSchedulesOutputDiv">
                  Fee Schedules
                  <code className="feeSchedulesCode">
                    <pre>{JSON.stringify(this.createCurrentAndNextFeeSchedule(), null, 2)}</pre>
                  </code>
                </div>
              </div>
            </Collapse>
          </>
        </Col>
      </Row>

    );
  }
}

export default FeeSchedules;
