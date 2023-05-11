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
import { Window } from "../../components";

import { Form, Button, Select, InputNumber, Space, Col, Row, Skeleton, Alert } from "antd";

const windowStyle = {
  left: "calc(50% - 300px)",
  top: "calc(50% - 265px)",
  width: "402px",
  height: "450px",
  maxHeight: "450px",
  maxWidth: "402px",
};

const inputStyle = {
  width: "130px",
};
const inputRotation = {
  width: "90px",
};
const inputRotationAngle = {
  width: "120px",
};

const WindowTitle = "Transform";

const composingMatrixFromTransform = (translate, rotate, scale, modelCenter, matrix) => {
  const translateMatrix = matrix.setTranslation([translate.x, translate.y, translate.z]);

  const rotateMatrix = matrix.setToRotation(rotate.angle, [rotate.x, rotate.y, rotate.z], modelCenter);

  const scaleMatrix = matrix.setToScaling(scale, modelCenter);
  return translateMatrix.postMultBy(rotateMatrix).postMultBy(scaleMatrix);
};

export class AssemblyTransformComponent extends Component {
  state = {
    models: [],

    translate: { x: 0.0, y: 0.0, z: 0.0 },
    scale: 0.0,
    rotate: { x: 0.0, y: 0.0, z: 0.0, angle: 0.0 },
    isLoading: true,
    isApplyProcess: false,
    isError: false,
    errorMessage: "",
  };

  selectedIndex = 0;

  componentDidMount() {
    try {
      this.setState({ isLoading: true });
      const { assembly } = this.props;

      const fileIdNameMap = new Map();
      assembly.associatedFiles.map((associatedFile) => fileIdNameMap.set(associatedFile.fileId, associatedFile.name));

      const viewer = this.props.viewer.visViewer();
      const modelList = [];
      let index = 0;
      for (const modelItr = viewer.getModelIterator(); !modelItr.done(); modelItr.step(), index++) {
        const model = modelItr.getModel();
        if (model.getName()[0] !== "$") {
          const transform = assembly.getModelTransformMatrix(model.getDatabaseHandle()) || {
            translate: { x: 0.0, y: 0.0, z: 0.0 },
            scale: 1.0,
            rotation: { x: 0.0, y: 0.0, z: 1.0, angle: 0.0 },
          };

          modelList.push({
            name: fileIdNameMap.get(assembly.files[index]),
            object: model,
            transform,
          });
        }
      }

      this.setState({ models: modelList, isLoading: false }, () => this.onChangeModel(0));
    } catch (err) {
      this.setState({
        isError: true,
        errorMessage: "Cannot load transform data",
      });
    }
  }

  componentWillUnmount() {
    const viewer = this.props.viewer.visViewer();
    if (viewer && this.selectionSet) {
      viewer.activeView.highlightAll(this.selectionSet, false);
      this.selectionSet.delete();
    }
  }

  onChangeModel = (index) => {
    this.selectedIndex = index;

    const viewer = this.props.viewer.visViewer();
    if (this.selectionSet) {
      viewer.activeView.highlightAll(this.selectionSet, false);
      this.selectionSet.delete();
    }

    this.selectionSet = viewer.activeView.selectCrossing([0, 9999, 9999, 0], this.state.models[index].object);

    viewer.activeView.highlightAll(this.selectionSet, true);

    const { transform } = this.state.models[index];

    viewer.update();

    this.setState({
      translate: transform.translate,
      rotate: transform.rotation,
      scale: transform.scale,
    });
  };

  onApply = async () => {
    try {
      this.setState({ isApplyProcess: true, isError: false });

      const uiModel = this.state.models[this.selectedIndex];
      const model = uiModel.object;

      const { assembly } = this.props;

      await assembly.setModelTransformMatrix(model.getDatabaseHandle(), {
        translate: this.state.translate,
        rotation: this.state.rotate,
        scale: this.state.scale,
      });

      const lib = this.props.viewer.visLib();

      model.setModelingMatrix(new lib.Matrix3d(), true);

      const extents = model.getExtents();
      const newMatrix = composingMatrixFromTransform(
        this.state.translate,
        this.state.rotate,
        this.state.scale,
        extents.center(),
        new lib.Matrix3d()
      );

      model.setModelingMatrix(newMatrix, true);

      const viewer = this.props.viewer.visViewer();
      viewer.update();

      const uiModels = [...this.state.models];

      uiModels[this.selectedIndex].transform = {
        translate: this.state.translate,
        rotation: this.state.rotate,
        scale: this.state.scale,
      };

      this.setState({ models: uiModels });
    } catch (error) {
      this.setState({
        isError: true,
        errorMessage: "Cannot apply transform for model",
      });
    } finally {
      this.setState({ isApplyProcess: false });
    }
  };

  onResetToDefault = () => {
    this.setState({
      translate: { x: 0.0, y: 0.0, z: 0.0 },
      scale: 1.0,
      rotate: { x: 0.0, y: 0.0, z: 1.0, angle: 0.0 },
    });
  };

  render() {
    const { models, translate, rotate, scale, isApplyProcess, isLoading, isError, errorMessage } = this.state;
    const uiTransform = (
      <div>
        <Form layout="vertical" size="middle">
          <Form.Item label="Choose model for transformation">
            <Select
              defaultValue={0}
              options={models.map((model, index) => ({ label: model.name, value: index }))}
              onChange={this.onChangeModel}
            />
          </Form.Item>
          <Form.Item label="Translation">
            <InputNumber
              style={inputStyle}
              addonBefore="X:"
              decimalSeparator="."
              value={translate.x}
              step={0.1}
              onChange={(value) => this.setState({ translate: { ...translate, x: value } })}
            />

            <InputNumber
              style={inputStyle}
              addonBefore="Y:"
              decimalSeparator="."
              value={translate.y}
              step={0.1}
              onChange={(value) => this.setState({ translate: { ...translate, y: value } })}
            />

            <InputNumber
              style={inputStyle}
              addonBefore="Z:"
              decimalSeparator="."
              value={translate.z}
              step={0.1}
              onChange={(value) => this.setState({ translate: { ...translate, z: value } })}
            />
          </Form.Item>
        </Form>

        <Form layout="vertical">
          <Form.Item label="Rotation">
            <InputNumber
              addonBefore="X:"
              style={inputRotation}
              decimalSeparator="."
              value={rotate.x}
              step={0.1}
              max={1.0}
              min={-1.0}
              onChange={(value) => this.setState({ rotate: { ...rotate, x: value } })}
            />

            <InputNumber
              addonBefore="Y:"
              style={inputRotation}
              decimalSeparator="."
              value={rotate.y}
              step={0.1}
              max={1.0}
              min={-1.0}
              onChange={(value) => this.setState({ rotate: { ...rotate, y: value } })}
            />

            <InputNumber
              addonBefore="Z:"
              style={inputRotation}
              decimalSeparator="."
              value={rotate.z}
              step={0.1}
              max={1.0}
              min={-1.0}
              onChange={(value) => this.setState({ rotate: { ...rotate, z: value } })}
            />

            <InputNumber
              addonBefore="Angle:"
              style={inputRotationAngle}
              decimalSeparator="."
              value={(rotate.angle * (180 / Math.PI)).toFixed(2)}
              step={0.1}
              min={0.0}
              max={360.0}
              onChange={(value) =>
                this.setState({
                  rotate: { ...rotate, angle: value * (Math.PI / 180) },
                })
              }
            />
          </Form.Item>
          <Form.Item label="Scale">
            <InputNumber
              style={inputRotation}
              decimalSeparator="."
              value={scale}
              step={0.1}
              min={0.1}
              onChange={(value) => this.setState({ scale: value })}
            />
          </Form.Item>
        </Form>

        <Form layout="inline" size="large">
          <Row>
            <Col span={48}>
              <Space style={{ width: "100%" }}>
                <Button type="primary" loading={isApplyProcess} onClick={this.onApply}>
                  Apply changes
                </Button>
                <Button loading={isApplyProcess} onClick={this.onResetToDefault}>
                  Reset to default
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>
    );

    const uiLoading = (
      <div>
        <Skeleton active />
        <Skeleton active />
      </div>
    );

    return (
      <Window className="properties-explorer" title={WindowTitle} style={windowStyle} onClose={this.props.onClose}>
        {isLoading ? uiLoading : uiTransform}
        {isError ? (
          <Alert
            style={{
              position: "absolute",
              top: "56px",
              zIndex: "1",
              left: "0px",
              width: "100%",
            }}
            message="Error"
            description={errorMessage}
            type="error"
            onClose={() => this.setState({ isError: false })}
            closable
          />
        ) : null}
      </Window>
    );
  }
}
