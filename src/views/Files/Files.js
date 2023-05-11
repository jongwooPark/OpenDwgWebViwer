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
import { Link } from "react-router-dom";
import moment from "moment";
import bytes from "bytes";
import FileSaver from "file-saver";
import sanitize from "sanitize-filename";
import { PageHeader, Table, Tooltip, Button, Modal } from "antd";
import {
  DeleteTwoTone,
  RightSquareTwoTone,
  CloudUploadOutlined,
  AppstoreAddOutlined,
  CloudDownloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { StatusTag, PreviewIcon, NameFilter } from "../../components";
import ClientFactory from "../../ClientFactory";
import { FilesService } from "../../services";
import { AppContext } from "../../AppContext";
import FileUploadModal from "./FileUploadModal";
import CreateAssembly from "./CreateAssembly";

import DefaultPreview from "../../assets/images/default-preview.png";

class Files extends React.Component {
  columns = [
    {
      title: "",
      dataIndex: "previewUrl",
      render: (previewUrl) => <PreviewIcon preview={previewUrl} defaultPreview={DefaultPreview} />,
      className: "d-none d-sm-table-cell",
      width: 140,
    },
    {
      title: "File Name",
      dataIndex: "name",
      render: (name, file) => {
        const readyToOpen = file.geometryStatus === "done" && ["done", "failed"].includes(file.propertiesStatus);
        return readyToOpen ? <Link to={`/files/${file.id}`}>{name}</Link> : name;
      },
      ...NameFilter("Filter by Name"),
      sorter: true,
      // ellipsis: { showTitle: false },
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type) => type.substring(1).toUpperCase(),
      filters: ClientFactory.getConfig().supportFormats.map((item) => ({
        text: item,
        value: item.toLowerCase(),
      })),
      ellipsis: { showTitle: false },
      width: "7%",
    },
    {
      title: "Size",
      dataIndex: "size",
      render: (size) => bytes.format(size, { decimalPlaces: 0, unitSeparator: " " }),
      ellipsis: { showTitle: false },
      width: "7%",
      sorter: true,
    },
    {
      title: "Geometry Status",
      dataIndex: "geometryStatus",
      render: (status) => <StatusTag status={status} />,
      ellipsis: { showTitle: false },
      width: "7%",
    },
    {
      title: "Properties Status",
      dataIndex: "propertiesStatus",
      render: (status) => <StatusTag status={status} />,
      ellipsis: { showTitle: false },
      width: "7%",
    },
    {
      title: "Created At",
      dataIndex: "created",
      render: (created) => moment(created).format("L LT"),
      ellipsis: { showTitle: false },
      width: "12%",
      sorter: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, file) => {
        return (
          <div>
            {file.geometryStatus === "done" && ["done", "failed"].includes(file.propertiesStatus) ? (
              <Link to={`/files/${file.id}`}>
                <Tooltip title="Open file in the viewer">
                  <RightSquareTwoTone className="mr-1 large-icon"></RightSquareTwoTone>
                </Tooltip>
              </Link>
            ) : null}
            <Tooltip title="Download original file">
              <CloudDownloadOutlined
                className="mr-2 large-icon"
                style={{ color: "#359eff" }}
                onClick={() => this.downloadOriginalFile(file)}
              />
            </Tooltip>
            <Tooltip title="Delete file">
              <DeleteTwoTone
                className="large-icon"
                twoToneColor="#ff4d4f"
                onClick={() =>
                  Modal.confirm({
                    title: "Delete the file?",
                    icon: <ExclamationCircleOutlined />,
                    okText: "Yes",
                    okType: "danger",
                    cancelText: "No",
                    cancelButtonProps: { type: "primary" },
                    onOk: () => this.deleteFile(file),
                  })
                }
              />
            </Tooltip>
          </div>
        );
      },
      ellipsis: { showTitle: false },
      width: "10%",
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      loading: true,
      error: "",
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        position: ["bottomCenter"],
        showSizeChanger: true,
      },
      filters: {
        name: [],
        type: [],
      },
      showFileUploadModal: false,
      showCreateAssemblyComponent: false,
      selectedFiles: [],
    };

    const supportFormats = ClientFactory.getConfig().supportFormats;
    this.supportFormats = new Map();
    supportFormats.forEach((format) => this.supportFormats.set(`.${format.toLowerCase()}`, 0));
  }

  componentDidMount() {
    const tableBody = document.querySelector(".ant-table-body");
    if (tableBody) {
      const styleUpdate = { height: tableBody.style.maxHeight };
      Object.assign(tableBody.style, styleUpdate);
    }

    this.getFiles();

    const isNeedUpdate = () => {
      return this.state.files
        .filter((file) => this.supportFormats.has(file.type.toLowerCase()))
        .some(
          (file) =>
            ["waiting", "inprogress"].includes(file.geometryStatus) ||
            ["waiting", "inprogress"].includes(file.propertiesStatus)
        );
    };

    this.interval = setInterval(() => {
      if (isNeedUpdate()) this.getFiles();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getFiles = async (page, pageSize, name, type, sortByDesc, sortField) => {
    const { pagination, filters } = this.state;
    if (page === undefined) page = pagination.current;
    if (pageSize === undefined) pageSize = pagination.pageSize;
    if (name === undefined) name = filters.name;
    if (type === undefined) type = filters.type;
    this.setState({ loading: true, error: "", filters: { name, type } });
    try {
      const files = await FilesService.getFiles(page, pageSize, name[0], type, sortByDesc, sortField);
      this.setState({
        files: files.result,
        loading: false,
        pagination: { ...pagination, total: files.allSize, current: page, pageSize },
      });
    } catch (e) {
      console.error("Cannot load files.", e);
      this.setState({ loading: false, error: e.message });
      this.context.app.addNotification("error", "Cannot get files");
    }
  };

  deleteFile = async (file) => {
    try {
      await file.delete();
      const { files, pagination } = this.state;
      this.setState({
        files: files.filter((x) => x !== file),
        pagination: { ...pagination, total: pagination.total - 1 },
      });
      this.context.app.addNotification("success", "File deleted");
    } catch (e) {
      console.error("Cannot delete file.", e);
      this.context.app.addNotification("error", "Cannot delete file");
    }
  };

  downloadOriginalFile = async (file) => {
    try {
      const arrayBuffer = await file.downloadResource(`${file.id}${file.type}`);
      const blob = new Blob([arrayBuffer]);
      FileSaver.saveAs(blob, sanitize(file.name));
      this.context.app.addNotification("success", "File download complete");
    } catch (e) {
      console.error("Cannot download file.", e);
      this.context.app.addNotification("error", "Cannot download file");
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.getFiles(
      pagination.current,
      pagination.pageSize,
      filters.name || [],
      filters.type || [],
      sorter.order ? sorter.order === "descend" : undefined,
      sorter.order ? sorter.field : undefined
    );
  };

  onSelectChange = (selectedRowKeys, selectedFiles) => {
    this.setState({ selectedFiles });
  };

  unselectFile(fileId) {
    this.setState({ selectedFiles: this.state.selectedFiles.filter((file) => file.id !== fileId) });
  }

  onShowCreateAssemblyDlg = () => {
    this.setState({ showCreateAssemblyComponent: true });
  };

  onCloseCreateAssemblyDlg = () => {
    this.setState({ showCreateAssemblyComponent: false });
  };

  onCreateAssembly = async (name, files) => {
    const fileIds = files.map((file) => file.id);
    try {
      await ClientFactory.get().createAssembly(fileIds, name);
      this.context.app.addNotification("success", "Assembly created");
    } catch (e) {
      console.error("Cannot create assembly.", e);
      this.context.app.addNotification("error", "Cannot create assembly");
    }

    this.setState({ selectedFiles: [], showCreateAssemblyComponent: false });
  };

  render() {
    const {
      showFileUploadModal,
      showCreateAssemblyComponent,
      files,
      pagination,
      filters,
      loading,
      error,
      selectedFiles,
    } = this.state;

    const filtered = filters.name.length > 0 || filters.type.length > 0;
    const emptyText = error
      ? "Error loading files"
      : loading
      ? " "
      : filtered
      ? "No files matching the filter"
      : "No files. To add a new file, click Upload File button.";

    const rowSelection = {
      selectedRowKeys: selectedFiles.map((file) => file.id),
      onChange: this.onSelectChange,
    };

    return (
      <React.Fragment>
        <PageHeader
          backIcon={false}
          title="Files"
          extra={[
            <Button
              key="upload"
              type="primary"
              icon={<CloudUploadOutlined />}
              disabled={loading || error}
              onClick={() => this.setState({ showFileUploadModal: true })}
            >
              <span className="d-none d-lg-inline">Upload File</span>
            </Button>,
            <Button
              key="assembly"
              icon={<AppstoreAddOutlined />}
              disabled={selectedFiles.length < 2}
              onClick={this.onShowCreateAssemblyDlg}
            >
              <span className="d-none d-lg-inline">Create Assembly</span>
            </Button>,
          ]}
        />
        <Table
          size="small"
          columns={this.columns}
          rowKey={(row) => row.id}
          dataSource={files}
          pagination={pagination}
          loading={loading}
          locale={{ emptyText }}
          onChange={this.handleTableChange}
          scroll={{ x: true, y: "calc(100vh - 170px)" }}
          rowSelection={rowSelection}
        />
        <FileUploadModal
          visible={showFileUploadModal}
          onUpload={() => {
            this.setState({ showFileUploadModal: false });
            this.getFiles();
          }}
          onClose={() => this.setState({ showFileUploadModal: false })}
        />
        {showCreateAssemblyComponent ? (
          <CreateAssembly
            files={selectedFiles}
            onResolve={this.onCreateAssembly}
            onCloseHandler={this.onCloseCreateAssemblyDlg}
            onRemove={(fileId) => this.unselectFile(fileId)}
          ></CreateAssembly>
        ) : null}
      </React.Fragment>
    );
  }
}

Files.contextType = AppContext;

export default Files;
