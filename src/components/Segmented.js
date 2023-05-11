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
import classNames from "classnames";
import { Segmented as AntdSegmented } from "antd";

function Segmented({ direction, ...props }) {
  const { options, disabled, value, onChange } = props;
  return direction === "vertical" ? (
    <div className="ant-segmented">
      <div className="ant-segmented-group flex-column">
        {options.map((x) => (
          <label
            key={x.value}
            className={classNames("ant-segmented-item", {
              "ant-segmented-item-disabled": x.disabled,
              "ant-segmented-item-selected": value === x.value,
            })}
            onClick={() => !disabled && onChange?.(x.value)}
          >
            <div className="ant-segmented-item-label">{x.label}</div>
          </label>
        ))}
      </div>
    </div>
  ) : (
    <AntdSegmented {...props} />
  );
}

export default Segmented;
