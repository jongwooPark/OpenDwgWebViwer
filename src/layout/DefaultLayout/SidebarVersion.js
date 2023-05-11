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
import { Tooltip } from "antd";
import ClientFactory from "../../ClientFactory";

import "./SidebarVersion.css";

function ShortVersion({ client, server }) {
  return (
    <React.Fragment>
      <div>{client}</div>
      <div>{server}</div>
    </React.Fragment>
  );
}

function FullVersion({ client, server }) {
  return (
    <React.Fragment>
      <div>Client version pp: {client}</div>
      <div>Server version: {server}</div>
    </React.Fragment>
  );
}

function SidebarVersion({ collapsed }) {
  const clientVersion = process.env.REACT_APP_VERSION || "";
  const [serverVersion, setServerVersion] = useState("");

  useEffect(() => {
    ClientFactory.get()
      .version()
      .then((data) => setServerVersion(data.version))
      .catch((e) => console.error("Cannot get server version.", e));
  }, []);

  return collapsed ? (
    <Tooltip placement="right" overlay={<FullVersion client={clientVersion} server={serverVersion} />}>
      <div className="sidebar-version text-muted">
        <ShortVersion client={clientVersion} server={serverVersion} />
      </div>
    </Tooltip>
  ) : (
    <div className="sidebar-version text-muted">
      <FullVersion client={clientVersion} server={serverVersion} />
    </div>
  );
}

export default SidebarVersion;
