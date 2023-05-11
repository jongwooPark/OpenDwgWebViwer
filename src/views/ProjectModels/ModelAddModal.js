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

import React, { useContext, useState, useEffect } from "react";
import { Form, Modal, Select, Typography } from "antd";

import { AppContext } from "../../AppContext";
import ClientFactory from "../../ClientFactory";

const { Text } = Typography;

export const actions = {
  read: "Read",
  write: "Write",
  readSourceFile: "Download Source",
  readViewpoint: "Read Viewpoints",
  createViewpoint: "Create Viewpoints",
};

// export const actions = [
//   { value: "read", label: "Read" },
//   { value: "write", label: "Write" },
//   { value: "readSourceFile", label: "Download Source" },
//   { value: "readViewpoint", label: "Read Viewpoints" },
//   { value: "createViewpoint", label: "Create Viewpoints" },
// ];

function ModelAddModal({ project, models, visible, onCreate, onClose }) {
  const { app } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      const client = ClientFactory.get();
      client
        .getFiles()
        .then((files) => files.result)
        .then((files) => files.filter((file) => !models.some((model) => model.file.file_name === file.name)))
        .then((files) => setFiles(files))
        .catch((e) => {
          console.error("Cannot get files.", e);
          app.addNotification("error", "Cannot get files");
        })
        .finally(() => setLoading(false));
    }
  }, [visible, project, models, app]);

  return (
    <Modal
      open={visible}
      title="Add Models"
      okText="Add Models"
      onOk={() => form.submit()}
      confirmLoading={creating}
      onCancel={creating ? undefined : onClose}
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        name="addmodels"
        layout="vertical"
        initialValues={{
          selected: undefined,
          actions: [],
        }}
        onFinish={(values) => {
          const { selected, actions } = values;
          const grantedTo = [{ project: { id: project.id, name: project.name } }];
          setCreating(true);
          Promise.allSettled(selected.map((index) => files[index].createPermission(actions, grantedTo)))
            .then((results) => {
              let fulfilled = 0;
              results.forEach((result, index) => {
                if (result.status === "rejected") {
                  const file = files[selected[index]];
                  console.error(`Cannot add file ${file.name} to a project.`, result.reason);
                  app.addNotification("error", `Cannot add file ${file.name} to a project`);
                } else {
                  fulfilled += 1;
                }
              });
              if (fulfilled) {
                app.addNotification("success", `Added ${fulfilled} of ${results.length} files`);
                onCreate();
              }
            })
            .catch((e) => {
              console.error("Cannot add models.", e);
              app.addNotification("error", "Cannot add models");
            })
            .finally(() => setCreating(false));
        }}
      >
        <Form.Item>
          <Text>
            You add models to the <Text strong>{project.name}</Text>
          </Text>
        </Form.Item>

        <Form.Item
          name="selected"
          label="File Name"
          rules={[{ required: true, message: "Select one or more files" }]}
          extra="You can only add your own files. Already added files are not shown in the list."
        >
          <Select
            loading={loading}
            mode="multiple"
            showArrow
            optionFilterProp="label"
            options={files.map((file, index) => ({ label: file.name, value: index }))}
          />
        </Form.Item>

        <Form.Item
          name="actions"
          label="Permissions"
          // rules={[{ required: true, message: "Select one or more permissions" }]}
        >
          <Select
            mode="multiple"
            showArrow
            optionFilterProp="label"
            options={Object.keys(actions).map((key) => ({ label: actions[key], value: key }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModelAddModal;
