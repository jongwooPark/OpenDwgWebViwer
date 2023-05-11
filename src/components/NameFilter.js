///////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2002-2021, Open Design Alliance (the "Alliance").
// All rights reserved.
//
// This software and its documentation and related materials are owned by
// the Alliance. The software may only be incorporated into application
// programs owned by members of the Alliance, subject to a signed
// Membership Agreement and Supplemental Software License Agreement with the
// Alliance. The structure and organization of target software are the valuable
// trade secrets of the Alliance and its suppliers. The software is also
// protected by copyright law and international treaty provisions. Application
// programs incorporating target software must include the following statement
// with their copyright notices:
//
//   This application incorporates Open Design Alliance software pursuant to a
//   license agreement with Open Design Alliance.
//   Open Design Alliance Copyright (C) 2002-2021 by Open Design Alliance.
//   All rights reserved.
//
// By use of target software, its documentation or related materials, you
// acknowledge and accept the above terms.
///////////////////////////////////////////////////////////////////////////////

import React from "react";
import { Input, Button } from "antd";
import { FilterFilled } from "@ant-design/icons";

function NameFilter(placeholder) {
  let searchInput = {};
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return (
        <React.Fragment>
          <div className="ant-table-filter-dropdown-search border-0">
            <Input
              ref={(node) => (searchInput = node)}
              placeholder={placeholder}
              value={selectedKeys.length ? selectedKeys[0] : ""}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
            />
          </div>
          <div className="ant-table-filter-dropdown-btns">
            <Button type="link" size="small" disabled={selectedKeys.length === 0} onClick={() => clearFilters()}>
              Reset
            </Button>
            <Button type="primary" size="small" onClick={() => confirm()}>
              OK
            </Button>
          </div>
        </React.Fragment>
      );
    },
    filterIcon: (filtered) => <FilterFilled style={{ color: filtered ? "#1890ff" : undefined }} />,
    onFilterDropdownVisibleChange: (visible) => {
      if (visible && searchInput.state) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
  };
}

export default NameFilter;
