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
import { Button, Col, Form, Image, Row, Typography, Upload } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";

import { Dropzone } from "../../components";
import { AppContext } from "../../AppContext";

const { Title, Text } = Typography;

function ProjectPreview({ project }) {
  const { app } = useContext(AppContext);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  return (
    <Form
      form={form}
      name="projectpreview"
      initialValues={{
        previewUrl: project.previewUrl,
      }}
      onFinish={(values) => {
        const { previewUrl } = values;
        setUpdating(true);
        project
          .setPreview(previewUrl)
          .then(() => {
            app.setProject(project);
            app.addNotification("success", "Project preview updated");
            fetch(project.previewUrl).catch(() => {}); // <- to refresh image in the browser cache
          })
          .catch((e) => {
            console.error("Cannot update preview.", e);
            app.addNotification("error", "Cannot update preview");
          })
          .finally(() => {
            setUpdating(false);
          });
      }}
    >
      <Row gutter={[16, 16]}>
        <Col lg={8} xs={24}>
          <Title level={5}>Preview Image</Title>
          <Text>JPEG, GIF, PNG, TIFF, BMP, ICO, SVG and WEBP. The maximum file size allowed is 1MB.</Text>
        </Col>
        <Col lg={16} xs={24}>
          <Form.Item name="previewUrl" valuePropName="src">
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
                        form.submit();
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
          <Form.Item>
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
                    form.submit();
                    onSuccess(file, {});
                  })
                  .catch((e) => {
                    console.error("Error reading image.", e);
                    onError(e, {});
                  });
              }}
            >
              <Button type="primary" loading={updating}>
                Choose image...
              </Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default ProjectPreview;
