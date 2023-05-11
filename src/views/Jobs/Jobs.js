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
import { Table, Tooltip, PageHeader } from "antd";

import { StatusTag, statusMap } from "../../components";
import { JobsService } from "../../services";
import { AppContext } from "../../AppContext";

class Jobs extends React.Component {
  columns = [
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <StatusTag status={status} />,
      filters: statusMap.map((x) => ({ text: x.text, value: x.status })),
      ellipsis: { showTitle: false },
      width: "7%",
    },
    {
      title: "Job ID",
      dataIndex: "id",
      ellipsis: { showTitle: false },
      width: "20%",
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (name, job) => {
        const to = job.fileId ? `/files/${job.fileId}` : `/assemblies/${job.assemblyId}`;
        return (
          <Tooltip title={job.fileId ? "File" : "Assembly"} placement="right">
            {job.status === "done" && name ? <Link to={to}>{name}</Link> : name || "(Deleted)"}
          </Tooltip>
        );
      },
      ellipsis: { showTitle: false },
    },
    {
      title: "Data To Convert",
      dataIndex: "outputFormat",
      ellipsis: { showTitle: false },
      width: "12%",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (createdAt) => moment(createdAt).format("L LT"),
      ellipsis: { showTitle: false },
      width: "12%",
      sorter: true,
    },
    {
      title: "Last Update",
      dataIndex: "lastUpdate",
      render: (lastUpdate) => moment(lastUpdate).format("L LT"),
      ellipsis: { showTitle: false },
      width: "12%",
      sorter: true,
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      loading: true,
      error: "",
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        position: ["bottomCenter"],
        showSizeChanger: true,
      },
      filters: { status: [] },
    };
  }

  componentDidMount() {
    const tableBody = document.querySelector(".ant-table-body");
    if (tableBody) {
      const styleUpdate = { height: tableBody.style.maxHeight };
      Object.assign(tableBody.style, styleUpdate);
    }

    this.getJobs();

    const isNeedUpdate = () => {
      return this.state.jobs.filter((job) => job.name).some((job) => ["waiting", "inprogress"].includes(job.status));
    };

    this.interval = setInterval(() => {
      if (isNeedUpdate()) this.getJobs();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getJobs = async (page, pageSize, status, sortByDesc, sortField) => {
    const { pagination, filters } = this.state;
    if (page === undefined) page = pagination.current;
    if (pageSize === undefined) pageSize = pagination.pageSize;
    if (status === undefined) status = filters.status;
    this.setState({ loading: true, error: "", filters: { status } });
    try {
      const jobs = await JobsService.getJobs(page, pageSize, status, sortByDesc, sortField);
      this.setState({
        jobs: jobs.result,
        loading: false,
        pagination: { ...pagination, total: jobs.allSize, current: page, pageSize },
      });
    } catch (e) {
      console.error("Cannot get jobs.", e);
      this.setState({ loading: false, error: e.message });
      this.context.app.addNotification("error", "Cannot get jobs");
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.getJobs(
      pagination.current,
      pagination.pageSize,
      filters.status || [],
      sorter.order ? sorter.order === "descend" : undefined,
      sorter.order ? sorter.field : undefined
    );
  };

  render() {
    const { jobs, pagination, filters, loading, error } = this.state;

    const filtered = filters.status.length > 0;
    const emptyText = error
      ? "Error loading jobs"
      : loading
      ? " "
      : filtered
      ? "No jobs matching the filter"
      : "No jobs";

    return (
      <React.Fragment>
        <PageHeader backIcon={false} title="Jobs" />
        <Table
          size="small"
          columns={this.columns}
          rowKey={(row) => row.id}
          dataSource={jobs}
          pagination={pagination}
          loading={loading}
          locale={{ emptyText }}
          onChange={this.handleTableChange}
          scroll={{ x: true, y: "calc(100vh - 170px)" }}
        ></Table>
      </React.Fragment>
    );
  }
}

Jobs.contextType = AppContext;

export default Jobs;
