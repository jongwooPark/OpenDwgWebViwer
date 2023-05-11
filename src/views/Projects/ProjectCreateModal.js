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
import { Button, Col, DatePicker, Form, Image, Input, Modal, Row, Space, Upload } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";

import { Dropzone } from "../../components";
import { ProjectsService } from "../../services";
import { AppContext } from "../../AppContext";

function ProjectCreateModal({ visible, onCreate, onClose }) {
  const { app } = useContext(AppContext);
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);

  return (
    <Modal
      open={visible}
      title="New Project"
      okText="Create Project"
      onOk={() => form.submit()}
      confirmLoading={creating}
      onCancel={creating ? undefined : onClose}
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        name="newproject"
        layout="vertical"
        initialValues={{
          name: "NewProject",
          startDate: moment(),
          endDate: moment().add(1, "year"),
          previewUrl: "",
        }}
        onFinish={async (values) => {
          setCreating(true);
          try {
            const { name, description, startDate, endDate, previewUrl } = values;

            const project = await ProjectsService.createProject(
              name,
              description,
              startDate.utc().toDate(),
              endDate.utc().toDate()
            );

            await project.setPreview(previewUrl).catch((e) => {
              console.error("Cannot set project preview.", e);
              app.addNotification("warning", "Cannot set project preview");
            });

            await project
              .createRole("read", "Grants permission to read project topics and documents.", {})
              .catch((e) => {
                console.error("Cannot initialize project roles.", e);
                app.addNotification("warning", "Cannot initialize project roles");
              });

            app.addNotification("success", "Project created");
            onCreate();
          } catch (e) {
            console.error("Cannot create project.", e);
            app.addNotification("error", "Cannot create project");
          } finally {
            setCreating(false);
          }
        }}
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, whitespace: true, message: "Input project name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
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
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item name="previewUrl" valuePropName="src" label="Preview Image">
              <Image
                style={{ height: 144, objectFit: "cover" }}
                fallback={`data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`}
                placeholder={true}
                preview={{
                  mask: (
                    <div className="ant-image-mask-info">
                      <div>
                        <EyeOutlined />
                        Preview
                      </div>
                      <div
                        onClick={(event) => {
                          event.stopPropagation();
                          form.setFieldsValue({ previewUrl: "" });
                        }}
                      >
                        <DeleteOutlined />
                        Remove
                      </div>
                    </div>
                  ),
                }}
              />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              label=" "
              colon={false}
              extra="JPEG, GIF, PNG, TIFF, BMP, ICO, SVG and WEBP. The maximum file size allowed is 1MB."
            >
              <Upload
                showUploadList={false}
                accept="image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  const isImage = file.type.indexOf("image/") === 0;
                  const isLess1M = file.size > 0 && file.size / 1024 / 1024 < 1;
                  return isImage & isLess1M ? true : Upload.LIST_IGNORE;
                }}
                customRequest={({ file, onSuccess, onError }) => {
                  Dropzone.readFileAsDataURL(file)
                    .then((url) => {
                      form.setFieldsValue({ previewUrl: url });
                      onSuccess(file, {});
                    })
                    .catch((e) => {
                      console.error("Error reading image.", e);
                      onError(e, {});
                    });
                }}
              >
                <Button className="mb-3">Choose image...</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default ProjectCreateModal;
