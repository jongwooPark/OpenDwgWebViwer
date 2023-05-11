///////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2002-2021, Open Design Alliance (the "Alliance").
// All rights reserved.
//
// This software and its documentation and related materials are owned by
// the Alliance. The software may only be incorporated into application
// programs owned by members of the Alliance, subject to a signed
// Membership Agreement and Supplemental Software License Agreement with the
// Alliance. The structure and organization of this software are the valuable
// trade secrets of the Alliance and its suppliers. The software is also
// protected by copyright law and international treaty provisions. Application
// programs incorporating this software must include the following statement
// with their copyright notices:
//
//   This application incorporates Open Design Alliance software pursuant to a
//   license agreement with Open Design Alliance.
//   Open Design Alliance Copyright (C) 2002-2021 by Open Design Alliance.
//   All rights reserved.
//
// By use of this software, its documentation or related materials, you
// acknowledge and accept the above terms.
///////////////////////////////////////////////////////////////////////////////

import React, { Component } from "react";
import { Dropdown, Button, PageHeader } from "antd";
import {
  ApartmentOutlined,
  CarryOutOutlined,
  BarsOutlined,
  BuildOutlined,
  ControlOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { SubscribeSubjectContext } from "../../utils/SubscribeSubjectContext";
import { AppContext } from "../../AppContext";

const defaultState = {
  fileName: "Loading...",
  modelList: [],
  activeModel: { database: "" },
  isEnableObjectExplorer: false,
  isEnableProperties: false,
  isEnable: false,
  isSupportViewPoint: false,
  isSupportTransform: false,
  isSupportSearch: false,
  isSupportValidate: false,
  isEnableHighlightSettings: false,
};

class HeaderComponent extends Component {
  state = { ...defaultState };

  constructor(props) {
    super(props);
    this.eventsConnection = props.eventsConnection;
    this.subscribeSubjectContext = new SubscribeSubjectContext();

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeFileInfo, (value) => {
      this.setState({ fileName: value.name });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeModelList, (value) => {
      this.setState({ modelList: value, activeModel: value[0] });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeEnableObjectExplorer, (value) => {
      this.setState({ isEnableObjectExplorer: value });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeEnableProperties, (value) => {
      this.setState({ isEnableProperties: value });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeEnable, (value) => {
      this.setState({ isEnable: value });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeSupportViewPoint, (isSupportViewPoint) => {
      this.setState({ isSupportViewPoint });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeSupportTransform, (isSupport) => {
      this.setState({ isSupportTransform: isSupport });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeSupportSearch, (isSupportSearch) => {
      this.setState({ isSupportSearch });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeSupportValidate, (isSupportValidate) => {
      this.setState({ isSupportValidate });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.onOpenError, () => {
      this.setState({
        fileName: `${props.isAssembly ? "Assembly" : "File"} not found or access denied, or load error`,
      });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.onOpenHighlightSettings, (isEnable) => {
      this.setState({ isEnableHighlightSettings: isEnable });
    });
  }

  componentWillUnmount() {
    this.subscribeSubjectContext.unsubscribe();
  }

  onOpenModel = (model) => {
    this.setState({ activeModel: model });
    this.eventsConnection.onOpenModel.next(model);
  };

  render() {
    const {
      fileName,
      modelList,
      activeModel,
      isEnableObjectExplorer,
      isEnableProperties,
      isEnable,
      isSupportViewPoint,
      isSupportTransform,
      isSupportSearch,
      isSupportValidate,
    } = this.state;

    const modelsMenu = {
      items: modelList.map((model) => ({
        key: model.database,
        label: model.name || "Default",
      })),
      onClick: (item) => {
        const model = modelList.find((x) => x.database === item.key);
        this.onOpenModel(model);
      },
      selectable: true,
      defaultSelectedKeys: [activeModel.database],
      selectedKeys: [activeModel.database],
    };

    const extra = [
      isSupportValidate && (
        <Button
          key="validate"
          disabled={!isEnable}
          icon={<CarryOutOutlined />}
          onClick={() => this.eventsConnection.onOpenValidateWindow.next()}
        >
          <span className="d-none d-lg-inline">Validate</span>
        </Button>
      ),
      isSupportTransform && (
        <Button
          key="transform"
          disabled={!isEnable}
          icon={<BuildOutlined />}
          onClick={() => this.eventsConnection.onOpenEdit.next()}
        >
          <span className="d-none d-lg-inline">Transform</span>
        </Button>
      ),
      isSupportSearch && (
        <Button
          key="search"
          disabled={!isEnableProperties}
          icon={<SearchOutlined />}
          onClick={() => this.eventsConnection.onOpenSearchWindow.next()}
        >
          <span className="d-none d-lg-inline">Search</span>
        </Button>
      ),
      isSupportViewPoint && (
        <Button
          key="viewpoints"
          disabled={!isEnable}
          icon={<VideoCameraOutlined />}
          onClick={() => this.eventsConnection.onOpenViewpointView.next()}
        >
          <span className="d-none d-lg-inline">Viewpoints</span>
        </Button>
      ),
      <Button
        key="explorer"
        disabled={!isEnableObjectExplorer}
        icon={<ApartmentOutlined />}
        onClick={() => this.eventsConnection.onOpenObjectExplorer.next()}
      >
        <span className="d-none d-lg-inline">Explorer</span>
      </Button>,
      <Button
        key="properties"
        disabled={!isEnableProperties}
        icon={<BarsOutlined />}
        onClick={() => this.eventsConnection.onOpenProperties.next()}
      >
        <span className="d-none d-lg-inline">Properties</span>
      </Button>,
      modelList.length > 1 && (
        <Dropdown key="models" menu={modelsMenu} placement="topRight">
          <Button disabled={!isEnable} icon={<ControlOutlined />}>
            <span className="d-none d-lg-inline">Models</span>
          </Button>
        </Dropdown>
      ),
      <Button
        key="highlightSettings"
        onClick={() => this.eventsConnection.onOpenHighlightSettings.next()}
        icon={<SettingOutlined />}
        title="Settings"
        disabled={!isEnable}
      ></Button>,
    ];

    return <PageHeader backIcon={false} title={fileName} extra={extra} />;
  }
}

HeaderComponent.contextType = AppContext;

export default HeaderComponent;
