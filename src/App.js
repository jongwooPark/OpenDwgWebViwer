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
import { Route, Routes, useNavigate } from "react-router-dom";

import { ErrorBoundary, Loading, PublicRoute, PrivateRoute } from "./components";
import ErrorStub from "./views/ErrorStub";
import Login from "./views/Login";
import Register from "./views/Register";
import DefaultLayout from "./layout";
import { AppContext } from "./AppContext";

import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const { app } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    app
      .loginFromStorage()
      .catch((e) => console.log("Cannot login from storage.", e.message))
      .finally(() => setLoading(false));
  }, [app]);

  return (
    <React.Fragment>
      <ErrorBoundary fallback={ErrorStub} onReset={() => navigate("/")}>
        <Loading loading={loading}>
          <Routes>
            <Route path="/login" element={<PublicRoute user={app.user} element={<Login />} />} />
            <Route path="/register" element={<PublicRoute user={app.user} element={<Register />} />} />
            <Route path="*" element={<PrivateRoute user={app.user} element={<DefaultLayout />} />} />
          </Routes>
        </Loading>
      </ErrorBoundary>
    </React.Fragment>
  );
}

export default App;
