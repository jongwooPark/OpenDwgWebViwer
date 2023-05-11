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
import { Button, Form, Switch } from "antd";
import { Colorpicker } from "antd-colorpicker";

import { Window } from "../../components";
import { AppContext } from "../../AppContext";
import ClientFactory from "../../ClientFactory";

import "./HighlightSettings.css";

function debounce(func, wait) {
  let timeout = null;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
}

function getData(fields, object) {
  return fields.reduce((acc, field) => {
    acc[field] = object[field];
    return acc;
  }, {});
}

const settingsFields = [
  "edgesColor",
  "facesColor",
  "edgesVisibility",
  "edgesOverlap",
  "facesOverlap",
  "facesTransparancy",
  "enableCustomHighlight",
];

function formValuesToHighligtingParams(values) {
  return {
    ...values,
    edgesColor: { r: values.edgesColor.r, g: values.edgesColor.g, b: values.edgesColor.b },
    facesColor: { r: values.facesColor.r, g: values.facesColor.g, b: values.facesColor.b },
    facesTransparancy: (1 - values.facesColor.a) * 255,
  };
}

function highligtingParamsToFormValues(params) {
  const result = {
    ...params,
    edgesColor: { ...params.edgesColor, a: 1 },
    facesColor: { ...params.facesColor, a: 1 - params.facesTransparancy / 255 },
  };
  return result;
}

export function HighlightSettings(props) {
  const { app } = useContext(AppContext);
  const [modified, setModified] = useState(0);

  const options = ClientFactory.get().options;
  const optionsData = getData(settingsFields, options);

  const initialValues = highligtingParamsToFormValues(optionsData);
  const [form] = Form.useForm();

  const saveOptions = debounce(
    (options, app) =>
      app.saveUserOptions({ ...options }).catch((e) => {
        console.error("Cannot save user settings.", e);
        app.addNotification("warning", "Cannot save user settings, changes may be lost after the next login");
      }),
    1000
  );

  const applySettings = (highligtingParams) => {
    options.data = highligtingParams;
    saveOptions(options.data, app);
  };

  const handleValuesChange = (_, values) => {
    const params = {
      ...formValuesToHighligtingParams(values),
      enableCustomHighlight: initialValues.enableCustomHighlight,
    };
    applySettings(params);
  };

  const handleEnableSwitch = (enabled) => {
    applySettings({ enableCustomHighlight: enabled });
    setModified(modified + 1);
  };

  const reset = () => {
    options.resetToDefaults(settingsFields);
    const optionsData = getData(settingsFields, options);
    saveOptions(optionsData, app);

    form.setFieldsValue(highligtingParamsToFormValues(optionsData));
  };

  return (
    <Window
      title="Highlight settings"
      style={{
        width: "min-content",
        height: "min-content",
        display: props.visible ? "flex" : "none",
      }}
      onClose={props.onClose}
    >
      <div className="highlight-settings">
        <div className="highlight-settings__enable-switcher">
          <Switch checked={initialValues.enableCustomHighlight} onChange={handleEnableSwitch} />
          <strong>Enable custom highlight</strong>
        </div>
        <Form
          className={!initialValues.enableCustomHighlight && "highlight-settings_highlight-disabled"}
          layout="horizontal"
          labelAlign="left"
          labelCol={{ span: 16 }}
          form={form}
          initialValues={initialValues}
          onValuesChange={handleValuesChange}
        >
          <Form.Item className="mb-0" label="Edges color" name="edgesColor">
            <Colorpicker popup onColorResult={(color) => color.rgb} />
          </Form.Item>
          <Form.Item className="mb-0" label="Faces color" name="facesColor">
            <Colorpicker popup onColorResult={(color) => color.rgb} />
          </Form.Item>
          <Form.Item className="mb-0" label="Edges visibility" name="edgesVisibility" valuePropName="checked">
            <Switch disabled={!initialValues.enableCustomHighlight} />
          </Form.Item>
          <Form.Item className="mb-0" label="Edges overlap" name="edgesOverlap" valuePropName="checked">
            <Switch disabled={!initialValues.enableCustomHighlight} />
          </Form.Item>
          <Form.Item label="Faces overlap" name="facesOverlap" valuePropName="checked">
            <Switch disabled={!initialValues.enableCustomHighlight} />
          </Form.Item>
          <Form.Item>
            <Button disabled={!initialValues.enableCustomHighlight} onClick={reset} type="primary">
              Reset to defaults
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Window>
  );
}
