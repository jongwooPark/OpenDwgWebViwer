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

import React, { useContext } from "react";
import { Button, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ClientFactory from "../../../src/ClientFactory";
import { AppContext } from "../../AppContext";

export function AvatarEditor({ avatarDataUrl, setAvatarDataUrl, isUpdating, setIsUpdating }) {
  const user = ClientFactory.get().getCurrentUser();
  const { app } = useContext(AppContext);

  async function updateAvatarDataUrl(file) {
    function getDataUrl(file) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
          resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      });
    }

    try {
      setIsUpdating(true);
      const newAvatarDataUrl = await getDataUrl(file);
      await user.setAvatar(newAvatarDataUrl);
      setAvatarDataUrl(newAvatarDataUrl);
      app.addNotification("success", "Avatar changed");
    } catch (error) {
      console.error("Cannot change avatar", error);
      app.addNotification("error", "Cannot change avatar");
    } finally {
      setIsUpdating(false);
    }
  }

  function imageIsValid(file) {
    if (file.size > 1048576) {
      app.addNotification("error", "Avatar image must be less than 1 MB");
      return false;
    }

    if (file.type.split("/")[0] !== "image") {
      app.addNotification("error", "Selected file is not an image");
      return false;
    }

    return true;
  }

  return (
    <div className="d-inline-block">
      <div className="d-flex justify-content-center">
        <Avatar size={170} icon={<UserOutlined />} src={avatarDataUrl.length ? avatarDataUrl : null} />
      </div>
      <input
        id="image-upload"
        accept="image/*"
        type="file"
        className="d-none"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            const avatarFile = e.target.files[0];

            if (imageIsValid(avatarFile)) {
              updateAvatarDataUrl(avatarFile);
            }
          }

          e.target.value = null;
        }}
      />
      <div className="d-flex justify-content-center mt-3">
        {isUpdating ? (
          <Button type="primary" loading>
            Change avatar
          </Button>
        ) : (
          <label htmlFor="image-upload" className="ant-btn ant-btn-primary">
            Change avatar
          </label>
        )}
      </div>
    </div>
  );
}
