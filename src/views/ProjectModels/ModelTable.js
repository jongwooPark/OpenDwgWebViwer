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

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import bytes from "bytes";
import FileSaver from "file-saver";
import sanitize from "sanitize-filename";
import { Avatar, List, Modal, Select, Table, Tag, Tooltip, Typography } from "antd";
import {
  DeleteTwoTone,
  CloudDownloadOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  RightSquareTwoTone,
} from "@ant-design/icons";

import { AppContext } from "../../AppContext";
import ClientFactory from "../../ClientFactory";
import { actions } from "./ModelAddModal";

const { Text } = Typography;

function ViewerLink({ project, model, canOpen, children }) {
  return canOpen ? (
    <Link className="ant-typography" to={`/projects/${project.id}/models/${model.file.reference}`}>
      {children}
    </Link>
  ) : (
    children
  );
}

function ModelTable({ project, refreshId }) {
  const { app } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [models, setModels] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const setRefreshId = useState()[1];
  const canUpdateProject = project.authorization.project_actions.includes("update");

  const columns = [
    {
      title: "File Name",
      dataIndex: "data",
      render: (data, model) => {
        const isAdminOrOwner = isAdmin || model.data["Owner"] === app.user.id;
        const canRead = isAdminOrOwner || model.data["Permissions"].find((x) => ["read", "write"].includes(x));
        const canOpen = canRead && model.data["Geometry Status"] === "done";
        return (
          <List.Item.Meta
            avatar={
              <ViewerLink project={project} model={model} canOpen={canOpen}>
                <Avatar shape="square" size="large" src={data["Preview URL"]} />
              </ViewerLink>
            }
            title={
              <ViewerLink project={project} model={model} canOpen={canOpen}>
                {data["Display Name"]}
              </ViewerLink>
            }
            description={
              <React.Fragment>
                <Text className="mr-2">by</Text>
                <Typography.Link className="mr-2" href={`mailto:${data["Owner Email"]}`}>
                  {data["Owner User Name"]}
                </Typography.Link>
                {data["Owner"] === app.user.id && <Tag color="green">It is you</Tag>}
              </React.Fragment>
            }
          />
        );
      },
      width: "40%",
      ellipsis: true,
    },
    {
      title: "Size",
      dataIndex: "data",
      render: (data) => bytes.format(Number(data["Size"]), { decimalPlaces: 0, unitSeparator: " " }),
      responsive: ["md"],
    },
    {
      title: "Permissions",
      dataIndex: "data",
      render: (data, model) => {
        const isAdminOrOwner = isAdmin || model.data["Owner"] === app.user.id;
        const canChange = isAdminOrOwner;
        return (
          <Select
            style={{ width: "100%" }}
            loading={model.updating}
            value={data["Permissions"] || ["No permissions granted"]}
            disabled={!canChange}
            mode="multiple"
            showArrow={canChange}
            optionFilterProp="label"
            options={Object.keys(actions).map((key) => ({ label: actions[key], value: key, disabled: model.updating }))}
            placeholder="No permissions granted"
            onChange={async (value) => {
              model.updating = true;
              setRefreshId(new Date());
              try {
                const client = ClientFactory.get();
                const file = await client.getFile(model.file.reference);
                const permissions = await file.getPermissions();
                await Promise.allSettled(
                  permissions
                    .filter((permission) => permission.grantedTo.some((x) => x.project?.id === project.id))
                    .map((permission) => permission.update({ actions: value }))
                );
                data["Permissions"] = value;
                setRefreshId(new Date());
                app.addNotification("success", "Permissions has been changed");
              } catch (e) {
                console.error("Cannot change permissions.", e);
                app.addNotification("error", "Cannot change permissions");
              } finally {
                model.updating = false;
                setRefreshId(new Date());
              }
            }}
          />
        );
      },
      width: "30%",
      responsive: ["sm"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, model) => {
        const isAdminOrOwner = isAdmin || model.data["Owner"] === app.user.id;
        const canRead = isAdminOrOwner || model.data["Permissions"].find((x) => ["read", "write"].includes(x));
        const canOpen = canRead && model.data["Geometry Status"] === "done";
        const canDownload = isAdminOrOwner || model.data["Permissions"].includes("readSourceFile");
        const canDelete = isAdminOrOwner;
        const DownloadIcon = model.downloading ? LoadingOutlined : CloudDownloadOutlined;
        return (
          <React.Fragment>
            {canOpen && (
              <ViewerLink project={project} model={model} canOpen={true}>
                <Tooltip title="Open model in the viewer">
                  <RightSquareTwoTone className="mr-1 large-icon"></RightSquareTwoTone>
                </Tooltip>
              </ViewerLink>
            )}
            {canDownload && (
              <Tooltip title="Download original file">
                <DownloadIcon
                  className="large-icon"
                  style={{ color: "#359eff" }}
                  onClick={
                    model.downloading
                      ? undefined
                      : async () => {
                          model.downloading = true;
                          setRefreshId(new Date());
                          try {
                            const client = ClientFactory.get();
                            const arrayBuffer = await client.downloadReferenceFile(model.file.reference);
                            const blob = new Blob([arrayBuffer]);
                            FileSaver.saveAs(blob, sanitize(model.file.file_name));
                            app.addNotification("success", "File downloaded");
                          } catch (e) {
                            console.error("Cannot download file.", e);
                            app.addNotification("error", "Cannot download file");
                          } finally {
                            model.downloading = false;
                            setRefreshId(new Date());
                          }
                        }
                  }
                />
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Remove model">
                <DeleteTwoTone
                  className="ml-2 large-icon"
                  twoToneColor="#ff4d4f"
                  onClick={() =>
                    Modal.confirm({
                      title: "Remove the model?",
                      icon: <ExclamationCircleOutlined />,
                      okText: "Yes",
                      okType: "danger",
                      cancelText: "No",
                      cancelButtonProps: { type: "primary" },
                      onOk: async () => {
                        try {
                          const client = ClientFactory.get();
                          const file = await client.getFile(model.file.reference);
                          const permissions = await file.getPermissions();
                          await Promise.allSettled(
                            permissions
                              .filter((permission) => permission.grantedTo.some((x) => x.project?.id === project.id))
                              .map((permission) => permission.delete())
                          );
                          const newModels = models.filter((x) => x.file.reference !== model.file.reference);
                          setModels(newModels);
                          app.addNotification("success", "Model removed");
                        } catch (e) {
                          console.error("Cannot remove model.", e);
                          app.addNotification("error", "Cannot remove model");
                        }
                      },
                    })
                  }
                />
              </Tooltip>
            )}
          </React.Fragment>
        );
      },
      width: "15%",
      ellipsis: "true",
      align: "end",
    },
  ];

  useEffect(() => {
    setLoading(true);
    project
      .getFilesInformation()
      .then((models) => {
        models.forEach((model) => {
          model.data = {};
          model.display_information.forEach((x) => (model.data[x.field_display_name] = x.field_value));
          model.data["Permissions"] = (model.data["Permissions"] || "").split(",").filter((x) => x);
        });
        return models;
      })
      .then((models) => setModels(models))
      .catch((e) => {
        console.error("Cannot get models.", e);
        app.addNotification("error", "Cannot get models");
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [project, app, refreshId]);

  useEffect(() => {
    // TODO: get isAdmin from the current user when it's supported
    const client = ClientFactory.get();
    client
      .getUsers()
      .then(() => setIsAdmin(true))
      .catch(() => {});
  }, []);

  const emptyText = error
    ? "Error loading models"
    : loading
    ? " "
    : `No models in the project. ${canUpdateProject ? " To add models, click Add Models button." : ""}`;

  const pagination = {
    showSizeChanger: true,
    showLessItems: true,
    responsive: true,
    disabled: loading,
    total: models.length,
  };

  return (
    <Table
      columns={columns}
      rowKey={(row) => row.file.reference}
      dataSource={models}
      pagination={pagination}
      loading={loading}
      locale={{ emptyText }}
      bordered={false}
      // showHeader={false}
    />
  );
}

export default ModelTable;
