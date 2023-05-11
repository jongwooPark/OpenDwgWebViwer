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
import { useLocation, useNavigate } from "react-router";
import { Menu } from "antd";
import { LinkOutlined, QuestionCircleOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";

import { ExamplesLink, DocLink } from "../../components";
import { AppContext } from "../../AppContext";

function Documentation() {
  return (
    <div className="d-flex">
      <DocLink />
      <LinkOutlined className="ml-auto align-self-center" />
    </div>
  );
}

function Examples() {
  return (
    <div className="d-flex">
      <ExamplesLink />
      <LinkOutlined className="ml-auto align-self-center" />
    </div>
  );
}

function SidebarBottomMenu({ className }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { app } = useContext(AppContext);
  const items = [
    {
      key: "help",
      label: "Help",
      icon: <QuestionCircleOutlined />,
      children: [
        { key: "documentation", label: <Documentation /> },
        { key: "examples", label: <Examples /> },
      ],
    },
    { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
    {
      key: "account",
      label: "Account",
      icon: <UserOutlined />,
      children: [
        { key: "/userinfo", label: "User Info" },
        { key: "logout", label: "Logout" },
      ],
    },
  ];
  return (
    <Menu
      className={className}
      selectedKeys={[location.pathname]}
      mode="inline"
      items={items}
      onClick={(item) => {
        if (item.key === "logout") app.logout();
        if (item.key[0] === "/") navigate(item.key);
      }}
    />
  );
}

export default SidebarBottomMenu;
