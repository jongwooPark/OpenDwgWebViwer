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
import { DeleteOutlined } from "@ant-design/icons";

import { Window } from "../../components";
import { SubscribeSubjectContext } from "../../utils/SubscribeSubjectContext";

import DefaultIcon from "../../assets/icons/default.svg";

const defaultState = {
  viewpoints: [],
};

export class ViewpointListComponent extends Component {
  state = { ...defaultState };

  constructor(props) {
    super(props);
    this.eventsConnection = props.eventsConnection;
    this.subscribeSubjectContext = new SubscribeSubjectContext();

    this.subscribeSubjectContext.subscribe(this.eventsConnection.changeViewpoints, (viewpoints) => {
      this.setState({ viewpoints: viewpoints || [] });
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.addViewpoint, (viewpoint) =>
      this.setState({ viewpoints: this.state.viewpoints.concat([viewpoint]) })
    );

    this.subscribeSubjectContext.subscribe(this.eventsConnection.modifyViewpoint, (viewpoint) => {
      const index = this.state.viewpoints.findIndex((x) => x.guid === viewpoint.guid);
      if (index !== -1) {
        this.state.viewpoints[index] = viewpoint;
        this.setState({ viewpoints: [...this.state.viewpoints] });
      }
    });

    this.subscribeSubjectContext.subscribe(this.eventsConnection.deleteViewpoint, (viewpoint) => {
      this.setState({ viewpoints: this.state.viewpoints.filter((x) => x.guid !== viewpoint.guid) });
    });
  }

  componentWillUnmount() {
    this.subscribeSubjectContext.unsubscribe();
  }

  onRemoveViewpoint(viewpoint) {
    this.eventsConnection.onRemoveViewpoint.next(viewpoint);
  }

  render() {
    const { viewpoints } = this.state;

    const viewPointsListTemplate = viewpoints.map((viewpoint, index) => {
      return (
        <div className="card mb-1" key={index} style={{ borderRadius: "0" }}>
          <img
            src={viewpoint?.snapshot?.data || DefaultIcon}
            style={{ width: "100%", height: "192px", objectFit: "contain", cursor: "pointer" }}
            className="card-img-top"
            alt="Snapshot"
            onClick={() => this.eventsConnection.onSelectViewpoint.next(viewpoint)}
          ></img>
          <div className="card-body px-2 py-0">
            <h5 className="card-title">
              {viewpoint.description}
              <DeleteOutlined
                className="large-icon cursor-pointer"
                style={{ float: "right" }}
                onClick={() => this.onRemoveViewpoint(viewpoint)}
              />
            </h5>
          </div>
        </div>
      );
    });

    return (
      <Window className="object-explorer" title="Viewpoints" onClose={() => this.eventsConnection.onClose.next()}>
        {viewPointsListTemplate}
      </Window>
    );
  }
}
