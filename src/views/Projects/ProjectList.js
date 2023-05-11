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
import { useNavigate } from "react-router-dom";
import { List } from "antd";

import ProjectCard from "./ProjectCard";
import { ProjectsService } from "../../services";
import { AppContext } from "../../AppContext";

function ProjectList({ refreshId }) {
  const { app } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const [projects, setProjects] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    ProjectsService.getProjects(pagination.page, pagination.pageSize)
      .then((projects) => {
        setProjects(projects);
      })
      .catch((e) => {
        console.error("Cannot get projects.", e);
        app.addNotification("error", "Cannot get projects");
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [pagination, refreshId, app]);

  const emptyText = error
    ? "Error loading projects"
    : loading
    ? " "
    : "No projects. To add a new project, click New Project button.";

  return (
    <List
      rowKey="id"
      loading={loading}
      locale={{ emptyText }}
      grid={{ gutter: 24, xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
      pagination={
        projects.allSize && {
          ...pagination,
          total: projects.allSize,
          showSizeChanger: true,
          showLessItems: true,
          responsive: true,
          disabled: loading,
          onChange: (page, pageSize) => setPagination({ page, pageSize }),
        }
      }
      dataSource={projects.result}
      renderItem={(project) => (
        <List.Item key={project.id}>
          <ProjectCard
            project={project}
            hoverable
            onClick={() => {
              app.setProject(project);
              navigate(`/projects/${project.id}`);
            }}
          />
        </List.Item>
      )}
    />
  );
}

export default ProjectList;
