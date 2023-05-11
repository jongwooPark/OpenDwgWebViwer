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

import React, { useContext } from "react";
import { matchPath } from "react-router";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "antd";
import { ExperimentOutlined } from "@ant-design/icons";

import { AppContext } from "../../AppContext";

function SidebarProjectMenu({ className }) {
  const { app } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const match = matchPath({ path: "/projects/:projectId", end: false }, location.pathname);
  const projectId = match ? match.params.projectId : 0;
  const { project } = app;
  const projectName = project ? project.name : projectId;
  const canUpdateProject = project && project.authorization.project_actions.includes("update");
  const items = [
    {
      key: "project",
      label: projectName,
      icon: <ExperimentOutlined />,
      children: [
        { key: `/projects/${projectId}`, label: "Information" },
        { key: `/projects/${projectId}/members`, label: "Members" },
        { key: `/projects/${projectId}/models`, label: "Models" },
        canUpdateProject && { key: `/projects/${projectId}/settings`, label: "Settings" },
      ],
    },
  ];
  return projectId ? (
    <Menu
      className={className}
      selectedKeys={[location.pathname]}
      mode="inline"
      items={items}
      onClick={(item) => navigate(item.key)}
    />
  ) : null;
}

export default SidebarProjectMenu;
