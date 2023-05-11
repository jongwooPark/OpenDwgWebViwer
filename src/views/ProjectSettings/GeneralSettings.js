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
import moment from "moment";
import { Button, Col, DatePicker, Form, Input, Row, Space, Typography } from "antd";

import { AppContext } from "../../AppContext";

const { Title, Text } = Typography;

function GeneralSettings({ project }) {
  const { app } = useContext(AppContext);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  return (
    <Form
      form={form}
      name="mainsettings"
      layout="vertical"
      initialValues={{
        name: project.name,
        description: project.description,
        startDate: moment(project.startDate),
        endDate: moment(project.endDate),
      }}
      onFinish={(values) => {
        const { name, description, startDate, endDate } = values;
        const data = {
          ...project.data,
          name,
          description,
          startDate: startDate.utc().toISOString(),
          endDate: endDate.utc().toISOString(),
        };
        setUpdating(true);
        project
          .update(data)
          .then(() => {
            app.setProject(project);
            app.addNotification("success", "Project settings have been saved");
          })
          .catch((e) => {
            console.error("Cannot save project settings.", e);
            app.addNotification("error", "Cannot save project settings");
          })
          .finally(() => {
            setUpdating(false);
          });
      }}
    >
      <Row gutter={[16, 16]}>
        <Col lg={8} xs={24}>
          <Title level={5}>General settings</Title>
          <Text>Update project name, description, start and end date.</Text>
        </Col>
        <Col lg={16} xs={24}>
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, whitespace: true, message: "Input project name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={5} />
          </Form.Item>
          <Space>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Input project start date" }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: "Input project end date" }]}>
              <DatePicker />
            </Form.Item>
          </Space>
          <Form.Item>
            <Button type="primary" loading={updating} onClick={() => form.submit()}>
              Update settings
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default GeneralSettings;
