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

import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.css";
import "./css/Font.css";
import "./css/App.css";
import "./css/MegaMenu.css";
import "./css/Tabs.css";
import './index.css';

import Price from "./calculator/Price";
import ConfigForm from "./components/ConfigForm.jsx";
//import PriceDetails from "./components/PriceDetails.jsx";
import FeeSchedules from "./components/FeeSchedules.jsx";
import EstimatorCartDisplay from "./components/EstimatorCartDisplay.jsx";
import EstimatorCart from "./components/EstimatorCart.jsx";
import MegaMenu from "./components/MegaMenu.jsx";
import PriceDisplay from "./components/PriceDisplay.jsx";
import hapiApis from './resources/APIsAndUsage.json';
import axios from "axios";

require("dotenv").config();

class App extends Component {
  constructor(props) {
    super(props);
    let apis = {};
    Object.entries(hapiApis).forEach(([service, serviceOps]) => {
      Object.entries(serviceOps).forEach(([operation, opParams]) => {
        apis[operation] = opParams;
      })
    });
    this.state = {
      nameFormState: "",
      exchangeRate: '',
      usageBreakdownDivOpen: true,
      isAuthenticated: true,
      estimatorCart: new EstimatorCart(),
      selectedApi: null,
      services: hapiApis,
      apis: apis,
      totalPrice: 0,
      totalUsage: null,
    };
    const NUM_NODES = 13;
    this.price = new Price(NUM_NODES, apis);
    this.apiSelectHandler = this.apiSelectHandler.bind(this);
    this.addToEstimatorButtonClickHandler = this.addToEstimatorButtonClickHandler.bind(this);
  }

  apiSelectHandler(selectedApi) {
    console.log("Selected api = ", selectedApi);
    let usageParams = null;
    if (selectedApi !== null) {
      // Create deep copy to not modify the instance in 'apis'.
      usageParams = JSON.parse(JSON.stringify(this.state.apis[selectedApi].usage));
    }
    this.setState({
      selectedApi: selectedApi,
      usageParams: usageParams
    });


    let usageAndPrice;
    if (selectedApi !== null) {
      let api = selectedApi;
      let apiParams = this.state.apis[api];
      usageAndPrice = this.price.calculatePrice(api, apiParams, usageParams);
      this.setState({
        totalUsage: usageAndPrice.usage,
        totalPrice: usageAndPrice.price
      });
    } else {
      console.log("Didnt find selectedApi!!!! State: ", this.state);
    }
  }

  addToEstimatorButtonClickHandler() {
    if (this.state.selectedApi !== null) {
      this.state.estimatorCart.addEstimate(
        this.state.selectedApi,
        this.state.totalPrice,
        1
      );
      this.apiSelectHandler(null);
    }
  }

  render() {

    const selectOpRow = (
      <div className="main-content">
        <MegaMenu
          apiSelectHandler={this.apiSelectHandler}
          selectedApi={this.state.selectedApi}
          services={this.state.services}
        />
      </div>
    );

    const middleRowConfig = (
      <div className="transaction-ops">
        <div id="configDiv">
          <div className="panel-title-col panel-title-col-3">
            <h2 className="panel-title step-3-title">Step 3</h2>
          </div>
          <ConfigForm
            key={Math.random()}
            context={this}
            apis={this.state.apis}
            selectedApi={this.state.selectedApi}
            usageParams={this.state.usageParams}
          />
        </div>
        <PriceDisplay
          addToEstimatorButtonClickHandler={this.addToEstimatorButtonClickHandler}
          totalPriceDivId="itemPrice"
          priceValue={this.state.totalPrice}
          isPriceValid={this.state.selectedApi !== null}
          exchangeRate={this.state.exchangeRate}
        />
      </div>
    );

    const priceCartDivRow = (
      <Row className="priceCartDivRow">
        <Col className="priceCartContainer">
          <div id="priceCartDiv">
            <div>
              <EstimatorCartDisplay
                context={this}
                exchangeRate={this.state.exchangeRate}
                estimatorCart={this.state.estimatorCart}
              />
            </div>
          </div>
        </Col>
        <PriceDisplay
            addToEstimatorButtonClickHandler={null}
            totalPriceDivId="estimateCartPrice"
            priceValue={this.state.estimatorCart.getTotalPrice()}
            exchangeRate={this.state.exchangeRate}
        />
      </Row>
    );

    let feeScheduleRow;
    if (process.env.REACT_APP_SHOW_FEE_SCHEDULE === "true") {
      feeScheduleRow = <FeeSchedules feeSchedules={this.price.feeSchedules} apis={this.state.apis}/>;
    }

    const normalViewRows = (
      <div>
        <div className="main-content">
          <div className="transaction-types">{selectOpRow}</div>
          <div className="transaction-details">{middleRowConfig}</div>
        </div>
        {priceCartDivRow}
        {feeScheduleRow}
      </div>
    );

    return (
      <div className="site-wrapper">
        <Helmet>
            <meta charSet="utf-8" />
            <title>Hedera Fee Tool</title>
            <meta name="description" content="Hedera's fee schedule is set by the Hedera Governing Council and always based in USD — making it easy to estimate API call costs." />
            <link rel="icon" type="image/png" href="https://hedera.com/assets/images/favicon.png" sizes="16x16" />
            <meta property="og:image" content="https://s3.amazonaws.com/hedera-hashgraph/HH-Social-Fees-Icon.jpg" />
        </Helmet>
        <div className="App content">
          <Container fluid={true}>
            {normalViewRows}
          </Container>
          <p style={{ textAlign: 'center', fontSize: '14px', maxWidth: '80%', margin: '36px auto 0' }}>
            *Hedera fee tool calculates fees required to process a transaction on the Hedera Network, however, such calculations may not be 100% accurate and are subject to change without prior notice.
          </p>
        </div>
        <div className="mobile-page">
          <div className="mobile-container">
            <h2 className="mobile-title">Hedera Fee Tool</h2>
            <p className="mobile-subtitle">
              Visit <a href="https://hedera.com/fees" style={{ color: 'white', textDecoration: 'underline' }}>hedera.com/fees</a>{' '}
              on a laptop or desktop sized device to estimate costs for your Hedera-powered decentralized application.
            </p>
             <div className="mobile-image">
              <img src="https://s3.amazonaws.com/hedera-hashgraph/Hedera-fee-estimator-icon-full-size.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* fetch current exchange rate when component mounts */
  componentDidMount() {
    axios.get(process.env.REACT_APP_PRICING_API_ENDPOINT)
      .then(response => {
        let hbars = response.data[0]["CurrentRate"]["hbarEquiv"];
        let cents = response.data[0]["CurrentRate"]["centEquiv"];
        let rateOfHbarInCents = cents / hbars;
        console.log('rate in cents = ', rateOfHbarInCents);
        this.setState({
          exchangeRate: rateOfHbarInCents
        });
      })
      .catch(error => {
        console.log('exchange API error = ', error);
        console.log("Setting exchange rate to 12");
        this.setState({
          exchangeRate: 12
        });
      })

      let usageAndPrice;
      if (this.state.selectedApi !== null) {
        let api = this.state.selectedApi;
        let apiParams = this.state.apis[api];
        usageAndPrice = this.price.calculatePrice(api, apiParams, this.state.usageParams);
        this.setState({
          totalUsage: usageAndPrice.usage,
          totalPrice: usageAndPrice.price
        });
      } else {
        console.log("Didnt find selectedApi!!!! State: ", this.state);
      }
  }
}

export default App;
