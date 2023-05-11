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
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Layout } from "antd";

import ViewerPage from "../../viewer/ViewerPage";
import Files from "../../views/Files";
import Assemblies from "../../views/Assemblies";
import Error404 from "../../views/Error404";
import Jobs from "../../views/Jobs";
import Options from "../../views/Options";
import Projects from "../../views/Projects";
import UserInfo from "../../views/UserInfo";
import ProjectDashboard from "../../views/ProjectDashboard";
import ProjectSettings from "../../views/ProjectSettings";
import ProjectMembers from "../../views/ProjectMembers";
import ProjectModels from "../../views/ProjectModels";
import Sidebar from "./Sidebar";

const { Content } = Layout;

function SidebarLayout() {
  return (
    <Layout className="vh-100 bg-white">
      <Sidebar theme="light" active="Files"></Sidebar>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}

function DefaultLayout() {
  return (
    <Routes>
      <Route element={<SidebarLayout />}>
        <Route index element={<Navigate to="/files" replace />} />
        <Route path="files">
          <Route index element={<Files />} />
          <Route path=":fileId" element={<ViewerPage />} />
        </Route>
        <Route path="assemblies">
          <Route index element={<Assemblies />} />
          <Route path=":assemblyId" element={<ViewerPage />} />
        </Route>
        <Route path="jobs" element={<Jobs />} />
        <Route path="settings" element={<Options />} />
        <Route path="userinfo" element={<UserInfo />} />
        <Route path="projects">
          <Route index element={<Projects />} />
          <Route path=":projectId">
            <Route index element={<ProjectDashboard />} />
            <Route path="models">
              <Route index element={<ProjectModels />} />
              <Route path=":fileId" element={<ViewerPage />} />
            </Route>
            <Route path="members" element={<ProjectMembers />} />
            <Route path="settings" element={<ProjectSettings />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default DefaultLayout;
