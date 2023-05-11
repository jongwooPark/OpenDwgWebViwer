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
import { Form, Input, List, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import { Window } from "../../components";

class CreateAssembly extends Component {
  state = { name: "" };

  windowStyle = {
    left: "calc(50% - 300px)",
    top: "calc(50% - 275px)",
    width: "600px",
    height: "auto",
    maxHeight: "550px",
  };

  title = "Create new assembly";

  handleRemoveFile = (fileId) => this.props.onRemove && this.props.onRemove(fileId);

  handleSubmit = () => {
    if (this.isValidForm()) {
      this.props.onResolve(this.state.name, this.props.files);
    }
  };

  handleChangeName = (event) => {
    this.setState({ name: event.target.value });
  };

  isValidFiles() {
    return this.props.files.length > 1;
  }

  isValidName() {
    return this.state.name;
  }

  isValidForm() {
    return this.isValidFiles() && this.isValidName();
  }

  render() {
    return (
      <Window
        className="object-explorer"
        title={this.title}
        resizable={false}
        style={this.windowStyle}
        onClose={this.props.onCloseHandler}
      >
        <Form name="assembly" layout="vertical" onFinish={this.handleSubmit}>
          <Form.Item
            style={{ flexDirection: "column" }}
            label="Name"
            // eslint-disable-next-line
            validateStatus={!this.isValidName() && "error"}
            // eslint-disable-next-line
            help={(!this.isValidName() && "Please choose a assembly name") || null}
          >
            <Input size="large" placeholder="Assembly name" onChange={this.handleChangeName} required={true} />
          </Form.Item>

          <Form.Item
            style={{ flexDirection: "column" }}
            label="Files"
            // eslint-disable-next-line
            validateStatus={!this.isValidFiles() && "error"}
            // eslint-disable-next-line
            help={(!this.isValidFiles() && "Please choose at least 2 files") || null}
          >
            <List
              bordered
              dataSource={this.props.files}
              renderItem={(file) => (
                <List.Item
                  extra={
                    <Button
                      type="text"
                      shape="circle"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => this.handleRemoveFile(file.id)}
                    />
                  }
                >
                  {file.name}
                </List.Item>
              )}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" disabled={!this.isValidForm()}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Window>
    );
  }
}

export default CreateAssembly;
