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
import { Table, Tooltip, PageHeader, Modal } from "antd";
import { DeleteTwoTone, RightSquareTwoTone, ExclamationCircleOutlined } from "@ant-design/icons";

import { StatusTag, PreviewIcon, NameFilter } from "../../components";
import { AssembliesService } from "../../services";
import { AppContext } from "../../AppContext";

import AssemblyPreview from "../../assets/images/assembly-preview.png";

class Assemblies extends React.Component {
  columns = [
    {
      title: "",
      dataIndex: "preview",
      render: (preview) => <PreviewIcon preview={preview} defaultPreview={AssemblyPreview} />,
      width: 140,
    },
    {
      title: "Assembly Name",
      dataIndex: "name",
      render: (name, assembly) => {
        const readyToOpen = assembly.status === "done";
        return readyToOpen ? <Link to={`/assemblies/${assembly.id}`}>{name}</Link> : name;
      },
      ...NameFilter("Filter by Name"),
      ellipsis: { showTitle: false },
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
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
      render: (_, assembly) => {
        return (
          <div>
            {assembly.status === "done" ? (
              <Link to={`/assemblies/${assembly.id}`}>
                <Tooltip title="Open assembly in the viewer">
                  <RightSquareTwoTone className="mr-2 large-icon" />
                </Tooltip>
              </Link>
            ) : null}
            <Tooltip title="Delete assembly">
              <DeleteTwoTone
                className="large-icon"
                twoToneColor="#ff4d4f"
                onClick={() =>
                  Modal.confirm({
                    title: "Delete the assembly?",
                    icon: <ExclamationCircleOutlined />,
                    okText: "Yes",
                    okType: "danger",
                    cancelText: "No",
                    cancelButtonProps: { type: "primary" },
                    onOk: () => this.deleteAssembly(assembly),
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
      assemblies: [],
      loading: true,
      error: "",
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        position: ["bottomCenter"],
        showSizeChanger: true,
      },
      filters: { name: [] },
    };
  }

  componentDidMount() {
    const tableBody = window.document.querySelector(".ant-table-body");
    if (tableBody) {
      const styleUpdate = { height: tableBody.style.maxHeight };
      Object.assign(tableBody.style, styleUpdate);
    }

    this.getAssemblies();

    const isNeedUpdate = () => {
      return this.state.assemblies.some((assembly) => ["waiting", "inprogress"].includes(assembly.status));
    };

    this.interval = setInterval(() => {
      if (isNeedUpdate()) this.getAssemblies();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getAssemblies = async (page, pageSize, name, sortByDesc, sortField) => {
    const { pagination, filters } = this.state;
    if (page === undefined) page = pagination.current;
    if (pageSize === undefined) pageSize = pagination.pageSize;
    if (name === undefined) name = filters.name;
    this.setState({ loading: true, error: "", filters: { name } });
    try {
      const assemblies = await AssembliesService.getAssemblies(page, pageSize, name[0], sortByDesc, sortField);
      this.setState({
        assemblies: assemblies.result,
        loading: false,
        pagination: { ...pagination, total: assemblies.allSize, current: page, pageSize },
      });
    } catch (e) {
      console.error("Cannot load assemblies.", e);
      this.setState({ loading: false, error: e.message });
      this.context.app.addNotification("error", "Cannot get assemblies");
    }
  };

  deleteAssembly = async (assembly) => {
    try {
      await assembly.delete();
      const { assemblies, pagination } = this.state;
      this.setState({
        assemblies: assemblies.filter((x) => x !== assembly),
        pagination: { ...pagination, total: pagination.total - 1 },
      });
      this.context.app.addNotification("success", "Assembly deleted");
    } catch (e) {
      console.error("Cannot delete assembly.", e);
      this.context.app.addNotification("error", "Cannot delete assembly");
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.getAssemblies(
      pagination.current,
      pagination.pageSize,
      filters.name || [],
      sorter.order ? sorter.order === "descend" : undefined,
      sorter.order ? sorter.field : undefined
    );
  };

  render() {
    const { assemblies, pagination, filters, loading, error } = this.state;

    const filtered = filters.name.length > 0;
    const emptyText = error
      ? "Error loading assemblies"
      : loading
      ? " "
      : filtered
      ? "No assemblies matching the filter"
      : "No assemblies. To create a new assembly, select two or more files in the Files view and click Create Assembly button.";

    return (
      <React.Fragment>
        <PageHeader backIcon={false} title="Assemblies" />
        <Table
          size="small"
          columns={this.columns}
          rowKey={(row) => row.id}
          dataSource={assemblies}
          pagination={pagination}
          loading={loading}
          locale={{ emptyText }}
          scroll={{ x: true, y: "calc(100vh - 170px)" }}
          onChange={this.handleTableChange}
        />
      </React.Fragment>
    );
  }
}

Assemblies.contextType = AppContext;

export default Assemblies;
