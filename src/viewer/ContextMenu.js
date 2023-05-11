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
import { Dropdown } from "antd";
import { contextMenuActions } from "./Actions";

function ContextMenu({ viewer, disabled, onClick, ...props }) {
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    viewer?.addEventListener("select", select);
    return () => viewer?.removeEventListener("select", select);
  }, [viewer]);

  function select({ data }) {
    setSelectedCount(data.isNull() ? 0 : data.numItems());
  }

  const context = { ...props, selectedCount };
  const when = (f) => (typeof f === "function" ? f(context) : true);
  const menuItems = contextMenuActions
    .filter((x) => when(x.visible))
    .map((x) => {
      const xDisabled = disabled || !when(x.enabled);
      return {
        key: x.name,
        label: <div className="px-2">{x.label || x.name}</div>,
        disabled: xDisabled,
      };
    });

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: ({ key }) => onClick(key),
      }}
      trigger={["contextMenu"]}
      openClassName=""
      {...props}
    />
  );
}

export default ContextMenu;
