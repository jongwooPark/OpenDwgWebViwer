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

import { ReactComponent as View } from "../assets/icons/actions.svg";
import { ReactComponent as Action } from "../assets/icons/view.svg";
import { ReactComponent as ZoomHome } from "../assets/icons/zoom-home.svg";

import { ReactComponent as ViewTop } from "../assets/icons/view-top.svg";
import { ReactComponent as ViewBottom } from "../assets/icons/view-bottom.svg";
import { ReactComponent as ViewLeft } from "../assets/icons/view-left.svg";
import { ReactComponent as ViewRight } from "../assets/icons/view-right.svg";
import { ReactComponent as ViewFront } from "../assets/icons/view-front.svg";
import { ReactComponent as ViewBack } from "../assets/icons/view-back.svg";
import { ReactComponent as ViewSW } from "../assets/icons/view-sw.svg";
// import { ReactComponent as ViewSE } from "../assets/icons/view-se.svg";
// import { ReactComponent as ViewNE } from "../assets/icons/view-ne.svg";
// import { ReactComponent as ViewNW } from "../assets/icons/view-nw.svg";

import { ReactComponent as ZoomWindow } from "../assets/icons/zoom-window.svg";
import { ReactComponent as Unselected } from "../assets/icons/unselected.svg";
import { ReactComponent as Isolate } from "../assets/icons/isolate.svg";
import { ReactComponent as Hide } from "../assets/icons/hide.svg";
import { ReactComponent as Show } from "../assets/icons/show.svg";
import { ReactComponent as Explode } from "../assets/icons/explode.svg";
import { ReactComponent as Collect } from "../assets/icons/collect.svg";
import { ReactComponent as Regen } from "../assets/icons/regen.svg";
import { ReactComponent as Reset } from "../assets/icons/reset.svg";
import { ReactComponent as Preview } from "../assets/icons/preview.svg";

const viewPosActions = [
  { name: "k3DViewSW", label: "Isometric", image: ViewSW },
  { name: "k3DViewTop", label: "Top", image: ViewTop },
  { name: "k3DViewBottom", label: "Bottom", image: ViewBottom },
  { name: "k3DViewLeft", label: "Left", image: ViewLeft },
  { name: "k3DViewRight", label: "Right", image: ViewRight },
  { name: "k3DViewFront", label: "Front", image: ViewFront },
  { name: "k3DViewBack", label: "Back", image: ViewBack },
  // { name: "k3DViewSW", label: "SW", image: ViewSW },
  // { name: "k3DViewSE", label: "SE", image: ViewSE },
  // { name: "k3DViewNE", label: "NE", image: ViewNE },
  // { name: "k3DViewNW", label: "NW", image: ViewNW },
];

export const objectActions = [
  {
    name: "Zoom To",
    image: ZoomWindow,
    enabled: ({ activeDragger, selectedCount }) => activeDragger !== "Walk" && selectedCount > 0,
  },
  { name: "Isolate", image: Isolate, enabled: ({ selectedCount }) => selectedCount > 0 },
  { name: "Hide", image: Hide, enabled: ({ selectedCount }) => selectedCount > 0 },
  { name: "Show All", image: Show },
  {
    name: "Unselect",
    label: "Clear Selection",
    image: Unselected,
    enabled: ({ selectedCount }) => selectedCount > 0,
  },
];

export const explodeActions = [
  { name: "Explode", image: Explode, visible: ({ is3D }) => is3D },
  { name: "Collect", image: Collect, visible: ({ is3D }) => is3D },
];

export const modelActions = [
  { name: "Regenerate", image: Regen },
  { name: "Reset Model", label: "Reset", image: Reset },
  { name: "Update Preview", image: Preview },
];

export const commonActions = [
  {
    name: "View",
    image: View,
    visible: ({ is3D }) => is3D,
    enabled: ({ activeDragger }) => activeDragger !== "Walk",
    children: viewPosActions,
  },
  { name: "ExplodeGroup", label: "Explode", image: Explode, visible: ({ is3D }) => is3D, children: explodeActions },
  { name: "Object", image: Unselected, children: objectActions },
  { name: "Model", image: Action, children: modelActions },
  { name: "Home", image: ZoomHome, enabled: ({ activeDragger }) => activeDragger !== "Walk" },
];

export const contextMenuActions = [
  {
    name: "Zoom To",
    image: ZoomWindow,
    enabled: ({ activeDragger }) => activeDragger !== "Walk",
    visible: ({ selectedCount }) => selectedCount > 0,
  },
  { name: "Isolate", image: Isolate, visible: ({ selectedCount }) => selectedCount > 0 },
  { name: "Hide", image: Hide, visible: ({ selectedCount }) => selectedCount > 0 },
  { name: "Show All", image: Show },
  {
    name: "Unselect",
    label: "Clear Selection",
    image: Unselected,
    visible: ({ selectedCount }) => selectedCount > 0,
  },
];
