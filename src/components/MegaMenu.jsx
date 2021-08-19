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
  Row,
  Col,
  Container,
  OverlayTrigger,
  Popover
} from "react-bootstrap";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

class MegaMenu extends React.Component {
  serviceLabels = {
    "Crypto": ["Cryptocurrency", "service"],
    "Tokens": ["Token", "service"],
    "Smart Contracts": ["Smart Contract", "service"],
    "Files": ["File", "service"],
    "Consensus": ["Consensus", "service"],
    "Miscellaneous": ["Miscellaneous", ""],
  };

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: -1,
      hasSelectedService: false
    };
    console.log('megamenu constructor');
  }

  createTabList() {
    console.log('createTabList');
    let tabsArr = [];
    Object.keys(this.props.services).forEach((service) => {
      tabsArr.push(
        <Tab key={service}>
          <div className="mm-column" key={"div_megamenu_service_" + service}>
              <div className="mm-column-header">{this.serviceLabels[service][0]}<br/>{this.serviceLabels[service][1]}</div>
          </div>
        </Tab>
      );
    });
    return tabsArr;
  }

  createTabPanels() {
    console.log('createTabPanels');
    let arr = [];
    Object.entries(this.props.services).forEach(([service, apis]) => {
      let subArr = [];
      Object.entries(apis).forEach(([api, apiTypes]) => {
        Object.entries(apiTypes).forEach(([apiType, apiParams]) => {
          let apiLabel = api;
          if(apiLabel === 'CryptoGetStakers' || apiLabel === 'CryptoAddLiveHash' || apiLabel === 'CryptoDeleteLiveHash' || apiLabel === 'CryptoGetLiveHash') {
            apiLabel += ' (coming soon)';
          }
          let className = "panel-item";
          if(this.props.selectedApi === api) {
            className += " panel-item--selected";
          }
          subArr.push(
            <div className={className} key={"div_megamenu_" + service + "_" + api}>
              <div className="apiOperationButtonDiv">
                <OverlayTrigger
                  trigger="hover"
                  key={"div_megamenu_tooltip_key_" + service + "_" + api}
                  placement="top"
                  delay={{ show: 500, hide: 150 }}
                  overlay={
                    <Popover id={"div_megamenu_tooltip_id_" + service + "_" + api} title={api}>
                      {apiParams.info.replace(". ", ".\n")}
                    </Popover>
                  }
                >
                  <button className="apiOperationButton" onClick={(e) => { this.props.apiSelectHandler(api); }}>
                    {apiLabel}
                  </button>
                </OverlayTrigger>
              </div>
            </div>
          );
        });
      });
      arr.push(
        <TabPanel key={Math.random()}>
          <div className="mm-column" key={"div_megamenu_service_" + service}>
            <div className="panel-container">
              {subArr}
            </div>
          </div>
        </TabPanel>
      );
    });
    return arr;
  }

  selectService(tabIndex) {
    console.log('selectService');
    if(this.refs.tabPanel) {
      if (!this.state.hasSelectedService) {
        this.refs.tabPanel.style.visibility = "visible";
        this.refs.panelTitle2SelectInfo.style.visibility = "visible";
      }
    }
    this.setState({
      tabIndex: tabIndex,
      hasSelectedService: true
    });
    this.props.apiSelectHandler(null);
  }

  render() {
    console.log('active tab = ', this.state.tabIndex);
    return (
      <div id="selectOperationDiv" ref="selectOperationDiv">
        <Container fluid={true}>
          <Row>
            <Col>
              <div className="mm-navbar">
                <div className="mm-dropdown" ref="mmDropDown">
                  <div className="mm-dropdown-content" ref="mmDropdownContent">

                    <div className="panel-title-col panel-title-col-1">
                      <h2 className="panel-title step-1-title">Step 1</h2>
                      <h2 className="select-info"><span>Select a</span>Hedera service</h2>
                      <br/>
                    </div>

                    <div className="panel-title-col panel-title-col-2">
                      <h2 className="panel-title step-2-title">Step 2</h2>
                      <h2 className="select-info" ref="panelTitle2SelectInfo" style={{visibility: 'hidden'}}><span>Select a</span>Network API</h2>
                    </div>

                    <div className="tab-list" ref="tabList">
                      <div className="mm-row">
                        <Tabs selectedIndex={this.state.tabIndex} onSelect={tabIndex => this.selectService(tabIndex)}>
                          <div ref="tabListItems">
                            <TabList>
                              {this.createTabList()}
                            </TabList>
                          </div>
                          <div className="tab-panels" ref="tabPanel" style={{visibility: 'hidden'}}>
                            {this.createTabPanels()}
                          </div>
                      </Tabs>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
export default MegaMenu;
