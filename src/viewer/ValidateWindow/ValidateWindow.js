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

import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import FileSaver from "file-saver";
import sanitize from "sanitize-filename";
import { Button, ConfigProvider, Divider, Dropdown, Empty, List, Space, Tag, Tooltip } from "antd";
import {
  CloseCircleTwoTone,
  DownOutlined,
  QuestionCircleTwoTone,
  StopTwoTone,
  WarningTwoTone,
} from "@ant-design/icons";

import { Window } from "../../components";

const LogicalResults = {
  Error: { Icon: CloseCircleTwoTone, color: "#ff4d4f" },
  UnSet: { Icon: WarningTwoTone, color: "#faad14" },
  Unknown: { Icon: QuestionCircleTwoTone, color: "#faad14" },
  "Unknown logical": { Icon: StopTwoTone, color: "silver" },
};

function ErrorIcon({ logical, ...rest }) {
  const { Icon, color } = LogicalResults[logical] || {};
  return Icon ? <Icon twoToneColor={color} {...rest} /> : null;
}

function FilterButton({ logical, filter, counters, onClick, ...rest }) {
  return (
    <Tooltip title={logical}>
      <Button
        type={filter.includes(logical) ? "primary" : undefined}
        icon={<ErrorIcon logical={logical} />}
        onClick={() => onClick(logical)}
        {...rest}
      >
        {(counters[logical] || 0) + ""}
      </Button>
    </Tooltip>
  );
}

export function ValidateWindow({ context, modelContext, onClose }) {
  const app = context.app;
  const file = modelContext.get();
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState([]);
  const [reportStatus, setReportStatus] = useState("none");
  const [counters, setCounters] = useState({});
  const [filter, setFilter] = useState(Object.keys(LogicalResults));
  const [filteredReport, setFilteredReport] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    file
      .waitForDone("validation", true, { signal: controller.signal })
      .then((file) => {
        setReportStatus(file.validationStatus);
        if (file.validationStatus === "done") {
          return file
            .downloadResource("validation_report.json")
            .then((arrayBuffer) => JSON.parse(Buffer.from(arrayBuffer).toString()))
            .then((report) => setReport(report));
        }
        return [];
      })
      .then(() => setLoading(false))
      .catch((e) => {
        if (e.name !== "AbortError") {
          setLoading(false);
          setReportStatus("error");
          console.error("Cannot load validation report.", e);
          app.addNotification("error", "Cannot load validation report");
        }
      });
    return function cleanup() {
      controller.abort();
    };
  }, [file, app, reload]);

  useEffect(() => {
    setCounters(
      report.reduce((counters, x) => {
        counters[x.logical] = (counters[x.logical] || 0) + 1;
        return counters;
      }, {})
    );
  }, [report]);

  useEffect(() => {
    setFilteredReport(report.filter((x) => filter.includes(x.logical)));
  }, [report, filter]);

  const handleReload = () => setReload(reload + 1);

  const handleValidate = () => {
    setReportStatus("waiting");
    file
      .validate()
      .then(() => setReload(reload + 1))
      .catch((e) => {
        setReportStatus("failed");
        console.error("Cannot validate file.", e);
        app.addNotification("error", "Cannot validate file");
      });
  };

  const handleFilter = (type) => {
    if (filter.includes(type)) setFilter(filter.filter((x) => x !== type));
    else setFilter(filter.concat([type]));
  };

  const handleDownload = (format) => {
    try {
      let text = "";
      if (format === "csv") {
        text = report.reduce((text, x) => text + Object.values(x).join(";") + "\r\n", "");
      } else {
        text = JSON.stringify(report, null, "  ");
      }
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const fileName = file.name.replace(".", "_") + "_validation_report." + format;
      FileSaver.saveAs(blob, sanitize(fileName));
    } catch (e) {
      console.error("Cannot download report.", e);
      app.addNotification("error", "Cannot download report");
    }
  };

  const pagination = {
    showSizeChanger: true,
    showLessItems: true,
    responsive: true,
    disabled: loading,
    total: filteredReport.length,
    size: "default",
  };

  const statusText = {
    none: "The validation has not yet been made.",
    waiting: "Starting validation job. Pelase wait...",
    inprogress: "Validation job in progress. Pelase wait...",
    failed: "Validation job failed. No validation report generated.",
  };

  const emptyText = loading
    ? "Loading validation report. Pelase wait..."
    : reportStatus === "error"
    ? "Error loading validation report"
    : reportStatus !== "done"
    ? statusText[reportStatus]
    : filter.length !== LogicalResults.length
    ? "No errors matching the filter"
    : "No errors found";

  const empty = (
    <Empty description={emptyText}>
      {reportStatus === "error" && (
        <Button type="primary" onClick={handleReload} loading={loading}>
          Reload
        </Button>
      )}
      {["none", "waiting", "failed"].includes(reportStatus) && file.owner === app.user.id && (
        <Button type="primary" onClick={handleValidate} loading={reportStatus === "waiting"}>
          Validate
        </Button>
      )}
    </Empty>
  );

  return (
    <Window
      className="properties-explorer"
      title="Validation Report"
      style={{
        left: "calc(50% - 290px)",
        width: "580px",
        maxWidth: "680px",
        minWidth: "500px",
      }}
      onClose={onClose}
    >
      <div className="h-100 d-flex flex-column">
        <Space className="mt-1">
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            disabled={reportStatus !== "done"}
            onClick={() => handleDownload("json")}
            menu={{
              items: [
                { key: "json", label: "Download as JSON" },
                { key: "csv", label: "Download as CSV" },
              ],
              onClick: (item) => handleDownload(item.key),
            }}
          >
            Download Report
          </Dropdown.Button>
          <span>Filter:</span>
          <Button.Group>
            {Object.keys(LogicalResults).map((x) => (
              <FilterButton key={x} logical={x} filter={filter} counters={counters} onClick={handleFilter} />
            ))}
          </Button.Group>
        </Space>
        <Divider className="my-2" />
        <div className="flex-grow-1 overflow-auto">
          <ConfigProvider renderEmpty={() => empty}>
            <List
              dataSource={filteredReport}
              pagination={pagination}
              loading={loading}
              size="small"
              renderItem={(item) => {
                return (
                  <List.Item className="px-0">
                    <List.Item.Meta
                      avatar={<ErrorIcon className="large-icon" logical={item.logical} />}
                      title={
                        <React.Fragment>
                          <span className="mr-1">#{item.handle}</span>
                          <Tag className="mr-1" color="blue">
                            {item.type}
                          </Tag>
                          {item.originalLabel && (
                            <Tag className="mr-1" color="green">
                              {item.originalLabel}
                            </Tag>
                          )}
                        </React.Fragment>
                      }
                      description={item.description}
                    />
                  </List.Item>
                );
              }}
            />
          </ConfigProvider>
        </div>
      </div>
    </Window>
  );
}
