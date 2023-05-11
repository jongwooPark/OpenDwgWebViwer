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

import React, { Component } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";

import $ from "jquery";
import "jquery-ui-bundle";

import "jquery-ui-bundle/jquery-ui.css";
import "./Window.css";

window.jQuery = window.$ = $;

class Window extends Component {
  state = {
    windowZIndex: 10,
  };

  removeSpaces = (title) => title.replace(" ", "");

  ref = React.createRef();

  close = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  componentDidMount() {
    const { resizable, title } = this.props;
    const truncatedTitle = this.removeSpaces(title);
    this.increaseWindowZIndex();
    const resizableVar = resizable === undefined ? true : resizable;

    if (resizableVar) {
      window.$(this.ref.current).resizable({
        stop: (event, ui) => {
          sessionStorage.setItem(truncatedTitle + "Width", ui.size.width + "px");
          sessionStorage.setItem(truncatedTitle + "Height", ui.size.height + "px");
        },
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.className &&
        prevProps.className.indexOf("d-none") > -1 &&
        this.props.className &&
        this.props.className.indexOf("d-none") < 0) ||
      (prevProps.style &&
        prevProps.style.display === "none" &&
        this.props.style &&
        (this.props.style.display === null || this.props.style.display !== "none"))
    ) {
      this.increaseWindowZIndex();
    }
  }

  increaseWindowZIndex = () => {
    const topWindowZIndex = parseInt(sessionStorage.getItem("topWindowZIndex")) || 10;
    sessionStorage.setItem("topWindowZIndex", topWindowZIndex + 1);
    this.setState({ windowZIndex: topWindowZIndex + 1 });
  };

  onDragStop = (event, ui) => {
    sessionStorage.setItem(this.removeSpaces(this.props.title) + "Transform", ui.node.style.transform);
  };

  render() {
    const { className, style, title, children } = this.props;
    const truncatedTitle = this.removeSpaces(title);
    const newStyle = style ? { ...style } : {};
    newStyle.zIndex = this.state.windowZIndex;
    let defaultX = 0;
    let defaultY = 0;
    const width = sessionStorage.getItem(truncatedTitle + "Width");
    const height = sessionStorage.getItem(truncatedTitle + "Height");
    const transform = sessionStorage.getItem(truncatedTitle + "Transform");
    if (width) {
      newStyle.width = width;
    }
    if (height) {
      newStyle.height = height;
    }
    if (transform) {
      newStyle.transform = transform;
      // translate(449px, -6px)
      const translateValues = transform.substring(10, transform.length - 1).split(", ");
      defaultX = parseInt(translateValues[0]);
      defaultY = parseInt(translateValues[1]);
    }

    const uiDraggableHandleClass = "ui-draggable-handle" + truncatedTitle;

    return (
      <Draggable
        handle={`.${uiDraggableHandleClass}`}
        onStop={this.onDragStop}
        defaultPosition={{ x: defaultX, y: defaultY }}
        onStart={this.increaseWindowZIndex}
        bounds="#root"
        cancel=".btn-close"
      >
        <div
          ref={this.ref}
          className={"window-dialog ui-resizable ui-draggable " + (className ?? "")}
          style={newStyle}
          onClick={this.props.onClick}
        >
          <div className={`window-dialog-head ui-draggable-handle ${uiDraggableHandleClass}`}>
            {title}
            <button
              type="button"
              className="close btn-close"
              data-dismiss="modal"
              aria-hidden="true"
              onClick={this.close}
            >
              ×
            </button>
          </div>
          <div className="card-body overflow-auto" style={{ padding: "5px" }} onClick={this.increaseWindowZIndex}>
            {children}
          </div>
        </div>
      </Draggable>
    );
  }
}

Window.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

export default Window;
