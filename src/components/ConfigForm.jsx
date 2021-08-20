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
import { Form, Col, OverlayTrigger, Popover } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import usageParamProperties from "../resources/usageParams.json";
import { isNull } from "util";
import parse from 'html-react-parser';

import "../css/ConfigForm.css";

class ConfigForm extends React.Component {
  apiTypeLabels = {
    "DEFAULT": "Default",
    "TOKEN_FUNGIBLE_COMMON": "Fungible Token",
    "TOKEN_NON_FUNGIBLE_UNIQUE": "Non-Fungible Token",
    "TOKEN_FUNGIBLE_COMMON_WITH_CUSTOM_FEES": "Custom Fungible Token",
    "TOKEN_NON_FUNGIBLE_UNIQUE_WITH_CUSTOM_FEES": "Custom Non-Fungible Token"
  }

  constructor(props) {
    super(props);
    this.state = {
      value: "",
      isEven: true,
      parametersToggleClass: "hideParameters"
    };

    //this.apiTypeLabels.DEFAULT = this.prop.service;

    this.handleConfigUpdate = this.handleConfigUpdate.bind(this);
    this.handleParametersToggle = this.handleParametersToggle.bind(this);
    this.handleTypeUpdate = this.handleTypeUpdate.bind(this);
  }

  handleParametersToggle(e) {
    console.log('handleParametersToggle');
    if(this.state.parametersToggleClass === 'hideParameters') {
      this.setState({parametersToggleClass: 'showParameters'});
    } else {
      this.setState({parametersToggleClass: 'hideParameters'});
    }
  }

  handleTypeUpdate(e) {
    console.log('handleTypeUpdate');
    var apiTypeSelect = document.querySelector("#apitype"),
        apiTypeSelection = apiTypeSelect.value;

        this.props.selectedTypeHandler(apiTypeSelection);
        console.log('***** apiTypeSelect.value:',apiTypeSelection);
  }

  handleConfigUpdate(e) {
    let usageParams = {};
    let tId = e.target.id;
    this.props.context.setState({usageParams: usageParams});
    Object.keys(this.props.usageParams).forEach((key) => {
      var item = document.querySelector("#form_" + key);
      if (isNull(item)) {
        return;
      }
      let val = item.value;
      if(val === '' || val.length === 0) {
        val = 0;
      }
      if(val !== "true" && val !== "false" && val.length > 0) {
        val = item.value.replace(/\D/g,'');
      }
      if (isNaN(Number(val))) {
        if (val === "true") {
          val = true;
        } else if (val === "false") {
          val = false;
        } else {
          val = item.value;
        }
      } else if(isNaN(Number(val)) === false) {
        if (val.length >= 6) {
          val = val.slice(0, 6);
        }
        val = parseFloat(val);
        if(val > 999999) {
          val = 999999;
        }
        if(val < 0) {
          val *= -1;
        }
      }
      usageParams[key] = val;
    });

    console.log('selectedAPI:',this.props.context.state.selectedApi,', seletedType:',this.props.context.state.selectedType);
    let usageAndPrice;
    if (this.props.context.state.selectedApi !== null && this.props.context.state.selectedType !== null) {
      let api = this.props.context.state.selectedApi;
      let apiParams = this.props.context.state.apis[api][this.props.context.state.selectedType];
      usageAndPrice = this.props.context.price.calculatePrice(api, apiParams, usageParams, this.props.context.state.selectedType);
      this.props.context.setState({
        totalUsage: usageAndPrice.usage,
        totalPrice: usageAndPrice.price
      });
    } else {
      console.log("Didnt find selectedApi!!!! State: ", this.props.context.state);
    }

    setTimeout(function(){
      var tInput = document.getElementById(tId);
      tInput.focus();
      tInput.selectionStart = tInput.value.length;
    }, 150);
  }

  formatParamLabel(label) {
    let labelText = label,
        labelTextLastWord = '';

    let labelTextArray = labelText.split(' ');
    if (labelTextArray.length > 1) {
      labelTextLastWord = labelTextArray[labelTextArray.length-1];
      labelText = labelText.replace(labelTextLastWord, '');
    } else {
      labelTextLastWord = labelText;
      labelText = '';
    }
    return labelText + '<span class="last-word">'+labelTextLastWord+'</span>';
  }

  getApiTypeLabel(type) {
    return this.apiTypeLabels[type];
  }

  render() {
    if (this.props.selectedApi == null) {
      return (
        <div className="dropdownSelectMessageOuter"/>
      );
    }
    let selectedApiParams = this.props.apis[this.props.selectedApi][this.props.selectedType];
    //console.log('*selectedApiParams',selectedApiParams);
    if (selectedApiParams === undefined || selectedApiParams.status === "incomplete") {
        return (
          <div className="dropdownSelectMessageOuter">
            <div className="dropdownSelectMessage">
              <div className="msgHead">Unavailable or incomplete API</div>
              <div className="msgBody">
                We apologize, but this API is either incomplete, or is not available on the mainnet at this time.
              </div>
            </div>
          </div>
        );
    }

    var apiTypesMenuOptions = [],
        showTypeMenu = true;
    for(const prop in this.props.apis[this.props.selectedApi]) {
      //console.log('apiTypesMenuOptions = ',prop,': '+this.props.apis[this.props.selectedApi][prop]);
      let typeLabel = this.getApiTypeLabel(prop);
      apiTypesMenuOptions.push({type: prop, label: typeLabel});
    }

    if(apiTypesMenuOptions.length === 1) {
      showTypeMenu = false;
    }   
    console.log('type menu length:',apiTypesMenuOptions.length,', showTypeMenu:',showTypeMenu);

    let colsArrHighImpact = [];
    let colsArrLowImpact = [];

    const usageParams = this.props.usageParams;
    console.log("usageParams in config form: ", usageParams);

    if(usageParams !== undefined && usageParams !== null) {
      Object.entries(usageParams).forEach(([key, value]) => {

        let isRelevant = selectedApiParams.relevantUsage[key]['isRelevant'];
        //console.log('isRelevant',isRelevant);
        let colsArr = (isRelevant) ? colsArrHighImpact : colsArrLowImpact;
        // console.log('value = ', value);
        let formControl;
        let dropDownBg;
        if (value === true || value === false) {
          // Special treatment for true/false values - turn them into dropdown list
          formControl = (
              <Form.Control
                as="select"
                value={value}
                onChange={this.handleConfigUpdate}
                key={"form_" + key}
                id={"form_" + key}
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </Form.Control>);
          dropDownBg = <div className="select-bg"></div>;
        } else {
          let onChangeHandler = this.handleConfigUpdate;
          if (value === 2160) {
            onChangeHandler = () => {};
          }
          // normal values. just add them into simple textfields
          formControl = (
            <Form.Control
              value={value}
              onChange={onChangeHandler}
              key={"form_" + key}
              id={"form_" + key}
              type="text"
            />);
        }
        colsArr.push(
          <Form.Group as={Col} className="configFormFormGroup">
            <OverlayTrigger
              trigger="hover"
              key={"div_megamenu_tooltip_key_" + key}
              placement="top"
              delay={{ show: 500, hide: 150 }}
              overlay={
                <Popover id={"div_megamenu_tooltip_id_" + key}>
                  {usageParamProperties[key].tip}
                </Popover>
              }
            >
              <Form.Label style={{ textAlign: "left" }}>
                {parse(this.formatParamLabel(usageParamProperties[key].label))}
              </Form.Label>
            </OverlayTrigger>
            {dropDownBg}
            {formControl}
            <span className="label-caption">{usageParamProperties[key].caption}</span>
          </Form.Group>
        )
      });
    }

    var formElementsHighImpact = [];
    var formElementsLowImpact = [];

    for (let impact of ['High', 'Low']) {
      let colsArr;
      let formElements;

      if (impact === 'High') {
          colsArr = colsArrHighImpact;
          formElements = formElementsHighImpact;
      } else {
          colsArr = colsArrLowImpact;
          formElements = formElementsLowImpact;
      }

      if (colsArr.length === 0) {
        formElements.push(
          <Form.Row key={Math.random()}>
            None
          </Form.Row>
        );
      } else {
        for (var i = 0; i < colsArr.length; i += 4) {
            formElements.push(
              <Form.Row key={i}>
                {colsArr[i]}
                {i < colsArr.length - 1 ? colsArr[i + 1] : <Col />} {/* adjust to " : <Col/>" or define a flex container */}
                {i < colsArr.length - 2 ? colsArr[i + 2] : <Col />} {/* adjust to " : <Col/>" or define a flex container */}
                {i < colsArr.length - 3 ? colsArr[i + 3] : <Col />} {/* adjust to " : <Col/>" or define a flex container */}
              </Form.Row>
            );
        }
      }
    }
    return (
      <div className="panel-body">
        <Form>
          <div className={showTypeMenu===true?'api-type-menu show':'api-type-menu hide'}>
            <h2 className="select-info"><span>Select a</span>Token type</h2>
            <div className="select-type"> 
              <div className="select-bg"></div>
              <Form.Control
                as="select"
                value={this.props.selectedType}
                onChange={this.handleTypeUpdate}
                key="apitype"
                id="apitype"
              >
                {apiTypesMenuOptions.map((typeData) =>
                  <option key={typeData.type} value={typeData.type}>{typeData.label==='Default'?this.props.selectedService:typeData.label}</option>
                )}
              </Form.Control>
            </div>     
          </div>

          <div className="title-row">
            <h2 className="select-info"><span>Enter the</span>API call parameters</h2>
            <div className="title-breadcrumb">
              <span className="title-breadcrumb-label">({this.props.selectedApi})</span>
            </div>
          </div>
          {formElementsHighImpact}
          <h3 className={'parameter-title parameter-title-2 '}>Parameters with minimal influence on price</h3>
          {formElementsLowImpact}
        </Form>
      </div>
    );
  }
}

export default ConfigForm;
