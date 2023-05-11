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
import React, { useState } from "react";
import { Button, PageHeader } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import ProjectList from "./ProjectList";
import ProjectCreateModal from "./ProjectCreateModal";

function Projects() {
  const [refreshId, setRefreshId] = useState();
  const [projectCreateModal, setProjectCreateModal] = useState(false);
  return (
    <div className="h-100 d-flex flex-column">
      <PageHeader
        backIcon={false}
        title="Projects"
        extra={[
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setProjectCreateModal(true)}>
            <span className="d-none d-lg-inline">New Project</span>
          </Button>,
        ]}
      />
      <div className="p-4 align-self-stretch overflow-auto">
        <ProjectList refreshId={refreshId} />
      </div>
      <ProjectCreateModal
        visible={projectCreateModal}
        onCreate={() => {
          setProjectCreateModal(false);
          setRefreshId(new Date());
        }}
        onClose={() => setProjectCreateModal(false)}
      />
    </div>
  );
}

export default Projects;
