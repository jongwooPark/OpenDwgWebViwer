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

import React, { useState, useEffect } from "react";
import { Dropdown } from "antd";
import { Segmented } from "../components";

import ColorSelector, { BLUE_COLOR, GREEN_COLOR, PINK_COLOR, RED_COLOR } from "../components/ColorSelector";

import { ReactComponent as Pan } from "../assets/icons/pan.svg";
import { ReactComponent as Orbit } from "../assets/icons/orbit.svg";
import { ReactComponent as ZoomWindow } from "../assets/icons/zoom-window.svg";
import { ReactComponent as Ruler } from "../assets/icons/ruler.svg";
import { ReactComponent as Walk } from "../assets/icons/walk.svg";
import { ReactComponent as Cutting } from "../assets/icons/cutting.svg";
import { ReactComponent as Clear } from "../assets/icons/clear.svg";
import { ReactComponent as Markup } from "../assets/icons/markup.svg";
import { ReactComponent as Save } from "../assets/icons/save-viewpoint.svg";

import { ReactComponent as CuttingX } from "../assets/icons/cutting-x.svg";
import { ReactComponent as CuttingY } from "../assets/icons/cutting-y.svg";
import { ReactComponent as CuttingZ } from "../assets/icons/cutting-z.svg";

import { ReactComponent as MarkupPen } from "../assets/icons/markup-pen.svg";
import { ReactComponent as MarkupText } from "../assets/icons/markup-text.svg";
import { ReactComponent as MarkupErase } from "../assets/icons/markup-erase.svg";

import { ReactComponent as KeyboardRight } from "../assets/icons/keyboard-right.svg";

import { commonActions } from "./Actions";

import "./Draggers.css";

const panDraggers = [
  { name: "Pan", image: Pan },
  { name: "Orbit", image: Orbit, visible: ({ is3D }) => is3D },
  { name: "Zoom", image: ZoomWindow },
  { name: "Walk", image: Walk, visible: ({ is3D }) => is3D },
];

const cuttingDraggers = [
  { name: "CuttingPlaneXAxis", label: "X Plane", image: CuttingX },
  { name: "CuttingPlaneYAxis", label: "Y Plane", image: CuttingY },
  { name: "CuttingPlaneZAxis", label: "Z Plane", image: CuttingZ },
  { name: "Clear Slices", label: "Cancel", image: Clear },
];

const markupDraggers = [
  { name: "Line", label: "Pen", image: MarkupPen },
  { name: "Text", image: MarkupText },
  { name: "Clear Markup", label: "Clear", image: MarkupErase },
];

const commonDraggers = [
  { name: "Pan", image: Pan, children: panDraggers },
  { name: "MeasureLine", label: "Ruler pp", image: Ruler },
  { name: "Cutting", image: Cutting, visible: ({ is3D }) => is3D, children: cuttingDraggers },
  {
    name: "Markup",
    image: Markup,
    visible: ({ isSupportViewpoints }) => isSupportViewpoints,
    children: markupDraggers,
    dropdown: MarkupDropdown,
  },
  {
    name: "Save Viewpoint",
    label: "Save View",
    image: Save,
    visible: ({ isSupportViewpoints }) => isSupportViewpoints,
  },
];

function MarkupDropdown({ markupColor, onChangeMarkupColor, ...props }) {
  return (
    <React.Fragment>
      <div className="draggers-list">
        <ColorSelector
          className="ant-segmented"
          colors={[RED_COLOR, GREEN_COLOR, BLUE_COLOR, PINK_COLOR]}
          selectedColor={markupColor}
          onColorSelected={onChangeMarkupColor}
        />
      </div>
      <DraggerList items={markupDraggers} {...props} />
    </React.Fragment>
  );
}

function DraggerImage({ dragger, disabled }) {
  const { image: Image, label, name } = dragger;

  let element;
  if (typeof Image === "string") element = <img src={Image} alt={label || name} />;
  else if (React.isValidElement(Image)) element = Image;
  else element = <Image title={label || name} />;

  const filter = disabled ? "grayscale(1) opacity(25%)" : "grayscale(0) opacity(100%)";
  return React.cloneElement(element, {
    style: {
      width: "1.75em",
      height: "1.75em",
      filter,
      transition: "filter 0.3s ease-in-out",
    },
  });
}

function DraggerItem({ dragger, disabled, className = "p-2" }) {
  return (
    <div className={className}>
      <DraggerImage dragger={dragger} disabled={disabled} />
      <div className="d-none d-lg-block">{dragger.label || dragger.name}</div>
    </div>
  );
}

function DraggerOpenArrow({ className, open }) {
  const transform = open ? "rotate(90deg)" : "rotate(-90deg)";
  return (
    <KeyboardRight
      className={className}
      style={{
        width: "0.75em",
        height: "auto",
        transform,
        transition: "transform .2s ease-in-out",
      }}
      fill="currentColor"
    />
  );
}

function DraggerDropdown({ dragger, ...props }) {
  const [open, setOpen] = useState(false);
  const dropdown = dragger.dropdown ? dragger.dropdown(props) : <DraggerList items={dragger.children} {...props} />;
  return (
    <Dropdown
      dropdownRender={() => dropdown}
      overlayClassName="draggers-dropdown-overlay"
      placement="top"
      trigger={["click"]}
      open={open}
      onOpenChange={(flag) => setOpen(flag)}
    >
      <div className="d-flex" onClick={(e) => e.preventDefault()}>
        <DraggerItem dragger={dragger} className="pl-2 py-2" disabled={props.disabled} />
        <DraggerOpenArrow className="align-self-start m-1" open={open} />
      </div>
    </Dropdown>
  );
}

function DraggerList({ items, className, ...props }) {
  const { activeDragger, disabled, onChange } = props;

  items.forEach((x) => {
    const item = x.children?.find((y) => y.name === activeDragger);
    if (item) {
      x.image = item.image;
      x.label = item.label || item.name;
    }
  });

  const context = { ...props };
  const when = (f) => (typeof f === "function" ? f(context) : true);
  const options = items
    .filter((x) => when(x.visible))
    .map((x) => {
      const xDisabled = disabled || !when(x.enabled);
      const dropdown = <DraggerDropdown dragger={x} {...props} disabled={xDisabled} />;
      const item = <DraggerItem dragger={x} disabled={xDisabled} />;
      return {
        label: x.children ? dropdown : item,
        value: x.name,
        disabled: xDisabled,
      };
    });

  const value = items.reduce(
    (draggerName, x) => (x.children && x.children.find((y) => y.name === draggerName) ? x.name : draggerName),
    activeDragger
  );

  return (
    <div className="draggers-list">
      <Segmented
        className={className}
        size="small"
        options={options}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}

function Draggers({ viewer, onChangeDragger, onAction, ...props }) {
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    viewer?.addEventListener("select", select);
    return () => viewer?.removeEventListener("select", select);
  }, [viewer]);

  function select({ data }) {
    setSelectedCount(data.isNull() ? 0 : data.numItems());
  }

  return (
    <div className="draggers">
      <div className="draggers-group">
        <DraggerList items={commonDraggers} onChange={onChangeDragger} selectedCount={selectedCount} {...props} />
        <DraggerList items={commonActions} onChange={onAction} selectedCount={selectedCount} {...props} />
      </div>
    </div>
  );
}

export default Draggers;
