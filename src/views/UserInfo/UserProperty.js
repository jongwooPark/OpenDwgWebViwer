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
import { Input } from "antd";
import { EditOutlined } from "@ant-design/icons";

export function UserProperty({ name, valueState, isEditableState }) {
  const [value, setValue] = valueState;
  const [isEditable, setIsEditable] = isEditableState ?? [false, () => {}];

  return (
    <div className="flex-grow-1 mr-3 mb-4">
      {name}
      <div className="mt-1">
        {isEditable ? (
          <Input
            defaultValue={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            style={{ maxWidth: "260px" }}
          />
        ) : (
          <div className="mt-2">
            {value.length > 0 && <span className="mr-2">{value}</span>}
            {isEditableState !== undefined && (
              <EditOutlined className="text-primary" onClick={() => setIsEditable(true)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
