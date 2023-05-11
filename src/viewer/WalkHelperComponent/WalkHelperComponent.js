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

import React from "react";
import { Button, Checkbox, Col, Modal, Row, Space, Tooltip, Typography } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";

const { Title } = Typography;

export function WalkHelperComponent({ visible, onClose, onDontShow }) {
  return (
    <Modal title="Navigation in first person mode" open={visible} onOk={onClose} onCancel={onClose} footer={false}>
      <Row gutter={[24, 8]}>
        <Col span={12}>
          <Row gutter={[8, 8]}>
            <Col>
              <Title level={4}>Walk</Title>
            </Col>
            <Col span={20}>
              <Row justify="center">
                <Tooltip title="Press key W to move forward">
                  <Button size="large" style={{ width: "50px" }}>
                    W
                  </Button>
                </Tooltip>
              </Row>
            </Col>
            <Col span={20}>
              <Row justify="center">
                <Space>
                  <Tooltip title="Press key A to move left">
                    <Button size="large" style={{ width: "50px" }}>
                      A
                    </Button>
                  </Tooltip>
                  <Tooltip title="Press key S to move backward">
                    <Button size="large" style={{ width: "50px" }}>
                      S
                    </Button>
                  </Tooltip>
                  <Tooltip title="Press key D to move right">
                    <Button size="large" style={{ width: "50px" }}>
                      D
                    </Button>
                  </Tooltip>
                </Space>
              </Row>
            </Col>
            <Col>
              <p>Press key W, S, A, D to move forward, backward, left, right</p>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Title level={4}>Look Around</Title>
            </Col>
            <Col span={20}>
              <Row justify="center">
                <Tooltip title="Drag mouse with left button pressed on view">
                  <Button size="large" style={{ width: "50px" }} icon={<VideoCameraOutlined />}></Button>
                </Tooltip>
              </Row>
            </Col>
            <Col span={24}>
              <p>Drag mouse with left button pressed on view</p>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row gutter={[8, 8]}>
            <Col>
              <Title level={4}>Adjust Speed</Title>
            </Col>
            <Col span={20}>
              <Row justify="center">
                <Space>
                  <Tooltip title="Press key + to increase movement speed">
                    <Button size="large" style={{ width: "50px" }}>
                      +
                    </Button>
                  </Tooltip>
                  <Tooltip title="Press key - to decrease movement speed">
                    <Button size="large" style={{ width: "50px" }}>
                      -
                    </Button>
                  </Tooltip>
                </Space>
              </Row>
            </Col>
            <Col>
              <p>Press key + or - to change movement speed</p>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row gutter={[8, 8]}>
            <Col>
              <Title level={4}>Go Up and Down</Title>
            </Col>
            <Col span={20}>
              <Row justify="center">
                <Space>
                  <Tooltip title="Press key Q to move up">
                    <Button size="large" style={{ width: "50px" }}>
                      Q
                    </Button>
                  </Tooltip>
                  <Tooltip title="Press key E to move down">
                    <Button size="large" style={{ width: "50px" }}>
                      E
                    </Button>
                  </Tooltip>
                </Space>
              </Row>
            </Col>
            <Col>
              <p>Press press Q, E to move up, down </p>
            </Col>
          </Row>
        </Col>
      </Row>
      <Checkbox className="mt-3" onChange={(e) => onDontShow(e.target.checked)}>
        Do not show this help again
      </Checkbox>
    </Modal>
  );
}
