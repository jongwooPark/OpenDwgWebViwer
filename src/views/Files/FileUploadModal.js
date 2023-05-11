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
import { Modal, Upload, Form } from "antd";

import { CloudUploadOutlined } from "@ant-design/icons";
import { AppContext } from "../../AppContext";
import ClientFactory from "../../ClientFactory";

function FileUploadModal({ visible, onUpload, onClose }) {
  const { app } = useContext(AppContext);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const supportFormats = (app.config.supportFormats || []).map((format) => format.toLocaleLowerCase());

  const handleSubmit = async (values) => {
    const client = ClientFactory.get();

    const setFileStatus = (fileName, percent, status) => {
      form.setFieldsValue({
        files: form.getFieldValue("files").map((entry) => {
          if (entry.name === fileName) {
            return { ...entry, percent: (percent * 100) | 0, status };
          }
          return entry;
        }),
      });
      form.setFieldsValue({
        refFiles: form.getFieldValue("refFiles").map((entry) => {
          if (entry.name === fileName) {
            return { ...entry, percent: (percent * 100) | 0, status };
          }
          return entry;
        }),
      });
    };

    const progress = (percent, file) => {
      setFileStatus(file?.name, percent, "uploading");
    };

    const uploadFile = (file) => {
      return client
        .uploadFile(file, { geometry: true, properties: true, onProgress: progress })
        .then((file) => {
          setFileStatus(file.name, 1, "done");
          return file;
        })
        .catch((e) => {
          console.error(`Cannot upload drawing file ${file.name}.`, e);
          setFileStatus(file.name, 0, "error");
          throw new Error("Cannot upload drawing file");
        });
    };

    const uploadReferences = (refFiles) => {
      return Promise.allSettled(
        refFiles.map((file) => client.uploadFile(file, { geometry: false, onProgress: progress }))
      )
        .then((results) => {
          return results
            .filter((result, index) => {
              if (result.status === "fulfilled") {
                setFileStatus(refFiles[index].name, 1, "done");
                return true;
              } else {
                setFileStatus(refFiles[index].name, 0, "error");
                console.error(`Cannot upload reference file ${refFiles[index].name}.`, result.reason);
                return false;
              }
            })
            .map((result) => result.value);
        })
        .then((files) => {
          const rejected = refFiles.length - files.length;
          if (rejected) {
            app.addNotification(
              "warning",
              `Cannot upload ${rejected} of ${refFiles.length} reference files, the file may not render correctly`
            );
          }
          return files.map((file) => ({ id: file.id, name: file.name }));
        });
    };

    setUploading(true);
    try {
      const { files, refFiles } = values;

      const file = await uploadFile(files[0].originFileObj);
      const references = await uploadReferences(refFiles.map((file) => file.originFileObj));

      await file.setReferences({ references }).catch((e) => {
        console.error("Cannot set drawing file references.", e);
        app.addNotification("warning", "Cannot set drawing file references, the file may not render correctly");
      });

      app.addNotification("success", "File uploaded");
      onUpload();
    } catch (e) {
      app.addNotification("error", e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Upload File"
      okText="Upload"
      onOk={() => form.submit()}
      confirmLoading={uploading}
      onCancel={uploading ? undefined : onClose}
      afterClose={() => form.resetFields()}
      closable={uploading}
    >
      <Form
        form={form}
        name="upload"
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          files: [],
          refFiles: [],
        }}
      >
        <Form.Item
          name="files"
          valuePropName="fileList"
          label="Drawing File"
          rules={[{ required: true, message: "Please choose drawing file" }]}
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload.Dragger
            accept={supportFormats.map((format) => `.${format}`).join(",")}
            listType="picture"
            maxCount={1}
            disabled={uploading}
            showUploadList={{ showRemoveIcon: !uploading }}
            progress={{ strokeWidth: 2, showInfo: true }}
            beforeUpload={(file) => {
              const fileName = file.name.toLocaleLowerCase();
              const isDrawing = supportFormats.some((format) => new RegExp(format).test(fileName));
              return isDrawing ? false : Upload.LIST_IGNORE;
            }}
            customRequest={(file) => file.onSuccess()}
          >
            <p>
              <CloudUploadOutlined className="mr-2 large-icon" />
              <span className="ant-upload-text">Click or drop file to upload</span>
            </p>
            <p className="ant-form-item-extra">{supportFormats.join(", ").toLocaleUpperCase()}</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          name="refFiles"
          valuePropName="fileList"
          label="Reference Files"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload.Dragger
            multiple={true}
            disabled={uploading}
            showUploadList={{ showRemoveIcon: !uploading }}
            progress={{ strokeWidth: 2, showInfo: true }}
            beforeUpload={(file) => {
              const isDublicate = form.getFieldValue("refFiles").some((x) => x.name === file.name);
              return isDublicate ? Upload.LIST_IGNORE : false;
            }}
            customRequest={(file) => file.onSuccess()}
          >
            <p>
              <CloudUploadOutlined className="mr-2 large-icon" />
              <span className="ant-upload-text">Click or drop files to upload</span>
            </p>
            <p className="ant-form-item-extra">
              Images, fonts, or any other files to correct rendering of the drawing file
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default FileUploadModal;
