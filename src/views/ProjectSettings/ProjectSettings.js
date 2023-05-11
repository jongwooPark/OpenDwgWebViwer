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
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Divider, Empty, PageHeader, Space, Spin } from "antd";

import { ProjectsService } from "../../services";
import GeneralSettings from "./GeneralSettings";
import ProjectPreview from "./ProjectPreview";
import ProjectDelete from "./ProjectDelete";
import { AppContext } from "../../AppContext";

function ProjectSettings() {
  const { app } = useContext(AppContext);
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [project, setProject] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    ProjectsService.getProject(projectId)
      .then((project) => {
        setProject(project);
        app.setProject(project);
      })
      .catch((e) => {
        console.error("Cannot get project info.", e);
        setProject();
        app.setProject();
        setError(e.message);
        app.addNotification("error", "Project not found or access denied");
      })
      .finally(() => setLoading(false));
  }, [projectId, app]);

  return (
    <div className="h-100 d-flex flex-column">
      <PageHeader backIcon={false} title="Project Settings" />
      <div className="align-self-stretch overflow-auto bg-gray p-4">
        <div style={{ margin: "auto", maxWidth: 1000 }}>
          <Spin spinning={loading}>
            {loading ? (
              <div style={{ minHeight: 53 }} />
            ) : project ? (
              <Space style={{ width: "100%" }} direction="vertical" split={<Divider />}>
                <GeneralSettings project={project} />
                <ProjectPreview project={project} />
                <ProjectDelete project={project} />
              </Space>
            ) : (
              <Empty description={error}>
                <Button type="primary" onClick={() => navigate("/projects")}>
                  Back to Projects
                </Button>
              </Empty>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
}

export default ProjectSettings;
