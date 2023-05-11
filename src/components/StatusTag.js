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
// programs incorporating this software must include the following statusment
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
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const JOB_STATUS = {
  NONE: "none",
  WAITING: "waiting",
  IN_PROGRESS: "inprogress",
  DONE: "done",
  FAILED: "failed",
};

const statusMap = [
  {
    status: JOB_STATUS.NONE,
    text: JOB_STATUS.NONE,
    color: "default",
    icon: <StopOutlined />,
  },
  {
    status: JOB_STATUS.WAITING,
    text: JOB_STATUS.WAITING,
    color: "default",
    icon: <ClockCircleOutlined />,
  },
  {
    status: JOB_STATUS.IN_PROGRESS,
    text: JOB_STATUS.IN_PROGRESS,
    color: "processing",
    icon: <SyncOutlined spin />,
  },
  {
    status: JOB_STATUS.DONE,
    text: JOB_STATUS.DONE,
    color: "success",
    icon: <CheckCircleOutlined />,
  },
  {
    status: JOB_STATUS.FAILED,
    text: JOB_STATUS.FAILED,
    color: "error",
    icon: <CloseCircleOutlined />,
  },
];

function StatusTag({ className, status }) {
  const item = statusMap.find((x) => x.status === status) || { status: "unknown", color: "default" };
  return (
    <div className={className}>
      <Tag color={item.color} icon={item.icon}>
        {item.text}
      </Tag>
    </div>
  );
}

export { JOB_STATUS, statusMap };

export default StatusTag;
