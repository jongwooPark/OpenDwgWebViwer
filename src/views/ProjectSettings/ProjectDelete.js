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
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Modal, Row, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import { AppContext } from "../../AppContext";

const { Title, Text } = Typography;

function ProjectDelete({ project }) {
  const { app } = useContext(AppContext);
  const [form] = Form.useForm();
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  return (
    <Form
      form={form}
      name="deleteproject"
      onFinish={(values) => {
        setDeleting(true);
        project
          .delete()
          .then(() => {
            app.setProject(null);
            app.addNotification("success", "Project deleted");
            navigate("/projects");
          })
          .catch((e) => {
            console.error("Cannot delete project.", e);
            app.addNotification("error", "Cannot delete project");
          })
          .finally(() => {
            setDeleting(false);
          });
      }}
    >
      <Row gutter={16}>
        <Col className="mb-4" lg={8} xs={24}>
          <Title level={5} type="danger">
            Delete project
          </Title>
        </Col>
        <Col lg={16} xs={24}>
          <Form.Item>
            <Text>Deleting a project cannot be undone.</Text>
          </Form.Item>
          <Form.Item>
            <Button
              type="danger"
              loading={deleting}
              onClick={() =>
                Modal.confirm({
                  title: "Delete the project?",
                  icon: <ExclamationCircleOutlined />,
                  okText: "Yes",
                  okType: "danger",
                  cancelText: "No",
                  cancelButtonProps: { type: "primary" },
                  onOk: () => form.submit(),
                })
              }
            >
              Delete project
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default ProjectDelete;
