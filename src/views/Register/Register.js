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

import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Alert, Button, Form, Input, Space } from "antd";
import { LinkOutlined } from "@ant-design/icons";

import { AppContext } from "../../AppContext";
import { DocLink } from "../../components";

import { ReactComponent as LogoFull } from "../../assets/images/logo-full.svg";

function Register() {
  const { app } = useContext(AppContext);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  return (
    <div>
      <div className="d-flex justify-content-end px-3">
        <DocLink />
        <LinkOutlined className="ml-2 align-self-center" />
      </div>
      <div className="login-content container-fluid">
        <div className="row">
          <div className="col-xs-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4 p-0">
            <LogoFull className="login-logo mb-3" />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4 auth-box">
            <h2 className="text-left" style={{ padding: "20px", color: "#18208a" }}>
              Register
            </h2>
            <Form
              name="register"
              layout="vertical"
              initialValues={{
                email: "",
                username: "",
                password: "",
              }}
              onFinish={(values) => {
                const { email, username, password } = values;
                setLoading(true);
                app
                  .loadConfig()
                  .then((config) => {
                    const url = `${config.registration_host}/register`;
                    const body = { email, username, password };
                    const options = {
                      method: "POST",
                      body: JSON.stringify(body),
                      headers: { "Content-Type": "application/json" },
                    };
                    return fetch(url, options);
                  })
                  .then((response) => response.json())
                  .then((answer) => {
                    if (answer.isOk) {
                      navigate("/");
                    } else {
                      console.error("Cannot register user.", answer.description);
                      setLoading(false);
                      setError(answer.description);
                    }
                  })
                  .catch((e) => {
                    console.error("Cannot register user.", e);
                    setLoading(false);
                    app.addNotification("error", "Registration server unavailable, please try again later");
                  });
              }}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Input a valid email" },
                ]}
                wrapperCol={{ span: 16 }}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="username"
                label="Name"
                rules={[
                  { required: true, message: "Name is required" },
                  { pattern: "[^\\s-]", message: "Name cannot contain spaces only" },
                ]}
                wrapperCol={{ span: 16 }}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Password is required" },
                  {
                    pattern: /^[a-zA-Z0-9_~!@#$%^&*()\-+={}[\]:;"'`<>,.?/|\\]+$/,
                    message: "Password can only contain letters, numbers, and special characters",
                  },
                ]}
                wrapperCol={{ span: 16 }}
              >
                <Input.Password />
              </Form.Item>

              {error ? (
                <Form.Item wrapperCol={{ span: 16 }}>
                  <Alert message={error} type="error" onClick={() => setError()} closable />
                </Form.Item>
              ) : null}

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Register
                  </Button>
                  <Button>
                    <Link to="/login">Cancel</Link>
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
