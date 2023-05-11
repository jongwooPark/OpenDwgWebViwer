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

import React, { useState, useContext, useRef } from "react";
import { Button, Input, PageHeader, Divider, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import ClientFactory from "../../../src/ClientFactory";
import { UserProperty } from "./UserProperty";
import { AppContext } from "../../AppContext";
import { AvatarEditor } from "./AvatarEditor";
import bytes from "bytes";

export default function UserInfo() {
  const user = ClientFactory.get().getCurrentUser();
  const { app } = useContext(AppContext);
  const [userDataIsUpdating, setUserDataIsUpdating] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState(user.avatarUrl);
  const [avatarIsUpdating, setAvatarIsUpdating] = useState(false);
  const inputApiTokenRef = useRef();
  const inputUserIdRef = useRef();

  const topUserProperties = [
    {
      key: "Email",
      name: "Email",
      valueState: useState(user.email),
    },
    {
      key: "FirstName",
      name: "First name",
      valueState: useState(user.firstName),
      isEditableState: useState(false),
    },
    {
      key: "LastName",
      name: "Last name",
      valueState: useState(user.lastName),
      isEditableState: useState(false),
    },
  ];

  const bottomUserProperties = [
    {
      key: "Storage",
      name: "Storage",
      valueState: useState(
        `Available: ${getSizeInMegabytes(user.data.storageLimit)} \u00A0\u00A0\u00A0\u00A0 Used: ${getSizeInMegabytes(
          user.data.storageUsed
        )}`
      ),
    },
    {
      key: "Projects",
      name: "Projects",
      valueState: useState(`User projects limit: ${user.projectsLimit}`),
    },
  ];

  function setIsEditableToFalseInUserProps() {
    topUserProperties.forEach((p) => p.isEditableState?.[1](false));
  }

  function getSizeInMegabytes(size) {
    if (size === -1) {
      return "unlimited";
    }

    return bytes.format(size, { decimalPlaces: 0, unitSeparator: " " });
  }

  async function saveChanges() {
    try {
      setUserDataIsUpdating(true);
      const firstName = topUserProperties.find((p) => p.key === "FirstName").valueState[0];
      const lastName = topUserProperties.find((p) => p.key === "LastName").valueState[0];

      await user.update({ firstName, lastName });
      setIsEditableToFalseInUserProps();
      app.addNotification("success", "User info saved");
    } catch (error) {
      console.error("Cannot save user info", error);
      app.addNotification("error", "Cannot save user info");
    } finally {
      setUserDataIsUpdating(false);
    }
  }

  function copyToClipboard(inputRef) {
    function copyToClipboardOldStyle(inputRef) {
      try {
        inputRef.current.select();
        document.execCommand("copy");
        inputRef.current.setSelectionRange(0, 0);
        app.addNotification("success", "Copied to clipboard");
      } catch (error) {
        console.error("Cannot copy to clipboard", error);
        app.addNotification("error", "Cannot copy to clipboard");
      }
    }

    async function copyToClipboardNewStyle(text) {
      try {
        await navigator.clipboard.writeText(text);
        app.addNotification("success", "Copied to clipboard");
      } catch (error) {
        console.error("Cannot copy to clipboard", error);
        app.addNotification("error", "Cannot copy to clipboard");
      }
    }

    if (!inputRef.current) {
      return;
    }

    if (navigator.clipboard) {
      copyToClipboardNewStyle(inputRef.current.input.value);
    } else {
      copyToClipboardOldStyle(inputRef);
    }
  }

  const fullPage = (
    <div className="h-100 overflow-auto bg-light d-none d-lg-block">
      <PageHeader title="Account" className="bg-white" />

      <div className="m-5 bg-white" style={{ maxWidth: "1200px" }}>
        <PageHeader className="pb-0" title="User Info" />
        <Divider className="mb-0" style={{ borderWidth: "2px" }} />

        <div className="d-flex">
          <div className="m-3">
            <AvatarEditor
              avatarDataUrl={avatarDataUrl}
              setAvatarDataUrl={setAvatarDataUrl}
              isUpdating={avatarIsUpdating}
              setIsUpdating={setAvatarIsUpdating}
            />
          </div>

          <div>
            <Divider type="vertical" className="h-100" style={{ borderWidth: "2px" }} />
          </div>

          <div className="w-100 ml-3 mt-4">
            <div className="d-flex flex-wrap">
              {topUserProperties.map((p) => (
                <UserProperty key={p.key} name={p.name} valueState={p.valueState} isEditableState={p.isEditableState} />
              ))}
            </div>

            <div className="mb-4">
              <Button type="primary" onClick={() => saveChanges()} loading={userDataIsUpdating}>
                Save
              </Button>
            </div>

            <Input.Group compact className="mb-4">
              <Input
                addonBefore="API Token"
                value={user.token}
                readOnly={true}
                ref={inputApiTokenRef}
                style={{ maxWidth: "370px" }}
              />
              <Tooltip title="Copy API Token">
                <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(inputApiTokenRef)} />
              </Tooltip>
            </Input.Group>

            <Input.Group compact className="mb-4">
              <Input
                addonBefore="User ID"
                value={user.id}
                readOnly={true}
                ref={inputUserIdRef}
                style={{ maxWidth: "370px" }}
              />
              <Tooltip title="Copy User ID">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    copyToClipboard(inputUserIdRef);
                  }}
                />
              </Tooltip>
            </Input.Group>

            {bottomUserProperties.map((p) => (
              <UserProperty key={p.key} name={p.name} valueState={p.valueState} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const compactPage = (
    <div className="h-100 overflow-auto d-block d-lg-none">
      <PageHeader title="Account / User Info" />
      <Divider className="mt-1" />
      <div className="ml-3">
        <div className="mt-3 mb-3">
          <AvatarEditor
            avatarDataUrl={avatarDataUrl}
            setAvatarDataUrl={setAvatarDataUrl}
            isUpdating={avatarIsUpdating}
            setIsUpdating={setAvatarIsUpdating}
          />
        </div>

        <div className="w-100">
          {topUserProperties.map((p) => (
            <UserProperty key={p.key} name={p.name} valueState={p.valueState} isEditableState={p.isEditableState} />
          ))}

          <div className="mb-4">
            <Button type="primary" onClick={() => saveChanges()} loading={userDataIsUpdating}>
              Save
            </Button>
          </div>

          <Input.Group compact className="mb-4">
            <Input
              addonBefore="API Token"
              value={user.token}
              readOnly={true}
              ref={inputApiTokenRef}
              style={{ maxWidth: "230px" }}
            />
            <Tooltip title="Copy API Token">
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  copyToClipboard(inputApiTokenRef);
                }}
              />
            </Tooltip>
          </Input.Group>

          <Input.Group compact className="mb-4">
            <Input
              addonBefore="User ID"
              value={user.id}
              readOnly={true}
              ref={inputUserIdRef}
              style={{ maxWidth: "230px" }}
            />
            <Tooltip title="Copy User ID">
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  copyToClipboard(inputUserIdRef);
                }}
              />
            </Tooltip>
          </Input.Group>

          {bottomUserProperties.map((p) => (
            <UserProperty key={p.key} name={p.name} valueState={p.valueState} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {compactPage}
      {fullPage}
    </>
  );
}
