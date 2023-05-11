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

import React, { Component, useState, useEffect, useContext } from "react";
import classNames from "classnames";

import { Window } from "../../components";
import { ReactComponent as KeyboardRight } from "../../assets/icons/keyboard-right.svg";

const EntityTypes = {
  kUndefined: 0, // An undefined type
  kEntity: 1, // An entity type.
  kInsert: 2, // An insert object.
  kLight: 3, // A light object.
};

const OdTvGeometryDataType = {
  kUndefinied: 0, // Undefined geometry.
  kPolyline: 1, // A polyline.
  kCircle: 2, // A circle.
  kCircleWedge: 3, // A circle wedge.
  kCircularArc: 4, // A circular arc.
  kEllipse: 5, // An ellipse.
  kEllipticArc: 6, // An elliptical arc.
  kPolygon: 7, // A polygon.
  kText: 8, // Text.
  kShell: 9, // A shell.
  kSphere: 10, // A sphere.
  kCylinder: 11, // A cylinder.
  kSubInsert: 12, // An insert sub-entity.
  kSubEntity: 13, // A sub-entity.
  kNurbs: 14, // A NURBS curve.
  kRasterImage: 15, // A raster image.
  kInfiniteLine: 16, // An infinite line.
  kMesh: 17, // A mesh.
  kPointCloud: 18, // A point cloud.
  kGrid: 19, // A grid.
  kColoredShape: 20, // A colored shape.
  kBox: 21, // A box.
  kBrep: 22, // A boundary representation object.
};

const TypeNameBinding = {
  0: "Undefined", // Undefined geometry.
  1: "Polyline", // A polyline.
  2: "Circle", // A circle.
  3: "CircleWedge", // A circle wedge.
  4: "CircularArc", // A circular arc.
  5: "Ellipse", // An ellipse.
  6: "EllipticArc", // An elliptical arc.
  7: "Polygon", // A polygon.
  8: "Text", // Text.
  9: "Shell", // A shell.
  10: "Sphere", // A sphere.
  11: "Cylinder", // A cylinder.
  12: "SubInsert", // An insert sub-entity.
  13: "kSubEntity", // A sub-entity.
  14: "Nurbs", // A NURBS curve.
  15: "RasterImage", // A raster image.
  16: "InfiniteLine", // An infinite line.
  17: "Mesh", // A mesh.
  18: "PointCloud", // A point cloud.
  19: "Grid", // A grid.
  20: "ColoredShape", // A colored shape.
  21: "Box", // A box.
  22: "Brep", // A boundary representation object.
};

const iterators = {
  Model: { pointer: (it) => it.getModel() },
  Block: { pointer: (it) => it.getBlock().openObject() },
  Layers: { pointer: (it) => it.getLayer().openObject() },
  Materials: { pointer: (it) => it.getMaterial().openObject() },
  VisualStyles: { pointer: (it) => it.getVisualStyle().openObject() },
  TextStyles: { pointer: (it) => it.getTextStyle().openObject() },
  Devices: { pointer: (it) => it.getDevice() },
  RasterImages: { pointer: (it) => it.getRasterImage().openObject() },
  Linetype: { pointer: (it) => it.getLinetype().openObject() },
  GeometryData: {
    pointer: (it) => {
      const geomId = it.getGeometryData();
      const type = geomId.getType();
      if (type === OdTvGeometryDataType.kSubEntity) {
        return geomId.openAsSubEntity();
      } else {
        return geomId;
      }
    },
    getName: (pointer) => {
      if (pointer["getType"]) {
        return TypeNameBinding[pointer.getType()];
      } else if (pointer["getName"]) {
        return `SubEntity ${pointer.getName()}`;
      }
      return pointer.$$.ptrType.registeredClass.name;
    },
  },
  Entities: {
    pointer: (it) => {
      const entityId = it.getEntity();
      if (entityId.getType() === EntityTypes.kEntity) {
        return entityId.openObject();
      } else if (entityId.getType() === EntityTypes.kInsert) {
        return entityId.openObjectAsInsert();
      } else {
        return entityId.openObjectAsLight();
      }
    },
    id: (it) => it.getEntity(),
  },
  CDATree: {
    pointer: (it) => {
      return it.getCDATreeStorage().getTree().getDatabaseNode();
    },
    getName: (pointer) => pointer.getNodeName(),
    id: (it) => {
      return null;
    },
  },
  children: {
    pointer: (it) => {
      return it.current();
    },
    getName: (pointer) => pointer.getNodeName(),
    id: (it, activeView) => it.current().getTvEntityId(activeView),
  },
};

const CDANodeArrowIcon = ({ hasChildren, expanded, onClick }) => {
  if (hasChildren) {
    const transform = expanded ? "rotate(90deg)" : undefined;
    return (
      <KeyboardRight
        className="cursor-pointer mr-2"
        style={{
          width: "0.85em",
          height: "auto",
          transform,
          transition: "transform .1s ease-in-out",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(!expanded);
        }}
      />
    );
  } else {
    return <span className="mr-2" style={{ width: "12px" }} />;
  }
};

const ObjectExplorerContext = React.createContext("objectExplorer");

class ObjectExplorer extends Component {
  constructor(props) {
    super(props);

    this.viewer0 = props.viewer;
    this.lib = props.viewer.visLib();
    this.viewer = props.viewer.visViewer();
    this.events = props.events;
    this.onAction = props.onAction;

    this.selected = [];
    this.handleGuiNodeMap = new Map();
    this.handleToSelectedSet = new Set();
  }

  render() {
    const { visible, isCDA, onClose } = this.props;
    return (
      <Window
        className="object-explorer"
        title="Object Explorer"
        onClose={onClose}
        style={visible ? { display: "flex" } : { display: "none" }}
      >
        <ObjectExplorerContext.Provider value={this}>
          {isCDA ? <CDATreeView /> : <OdNode pointer={this.viewer} isRoot />}
        </ObjectExplorerContext.Provider>
      </Window>
    );
  }
}

function CDATreeView() {
  const [storageList, setStorageList] = useState([]);
  const context = useContext(ObjectExplorerContext);

  useEffect(() => {
    const entitySelectSubject = context.events.onEntitySelect.subscribe({
      next: (handles) => {
        context.selected.forEach((x) => x.highlight(false));

        context.handleToSelectedSet.clear();
        context.selected = [];

        for (const handle of handles) {
          const treeItem = context.handleGuiNodeMap.get(handle);
          if (treeItem) {
            treeItem.highlight(true);
            context.selected.push(treeItem);
          }

          context.handleToSelectedSet.add(handle);
        }
      },
    });
    return () => {
      entitySelectSubject && entitySelectSubject.unsubscribe();
    };
  });

  useEffect(() => {
    const list = [];
    const itr = context.viewer.getCDATreeIterator();
    while (!itr.done()) {
      const storage = itr.getCDATreeStorage();
      const tree = storage.getTree();
      const node = tree.getDatabaseNode();
      list.push(node);
      itr.step();
    }
    setStorageList(list);
  }, [context.viewer, setStorageList]);

  return (
    <ul>
      {storageList.map((x, index) => (
        <li key={index}>
          <CDANode node={x} name="CDA" />
        </li>
      ))}
    </ul>
  );
}

function collectHighlightNodes(node, activeView, highlightNodes) {
  const array = node.getChildren();
  if (array.length() === 0) {
    const entityId = node.getTvEntityId(activeView);
    if (!entityId.isNull()) {
      highlightNodes.appendEntity(entityId);
    }
  } else {
    for (let i = 0; i < array.length(); i++) {
      const nodePtr = array.get(i);
      collectHighlightNodes(nodePtr, activeView, highlightNodes);
    }
  }
}

class CDANode extends Component {
  constructor(props) {
    super(props);
    this.state = { handle: "-1", children: [], expanded: false, highlight: false };
  }

  componentDidMount() {
    const { node } = this.props;

    let handle = "-1";
    const activeView = this.context.viewer.activeView;
    const entityId = node.getTvEntityId(activeView);
    if (!entityId.isNull()) {
      const obj =
        entityId.getType() === 1
          ? entityId.openObject()
          : entityId.getType() === 2
          ? entityId.openObjectAsInsert()
          : null;

      if (obj) {
        handle = obj.getNativeDatabaseHandle();
        obj.delete();
      }
    }
    if (handle !== "-1") {
      this.context.handleGuiNodeMap.set(handle, this);
      if (this.context.handleToSelectedSet.has(handle)) {
        this.highlight(true);
        this.context.selected.push(this);
      }
    }

    const children = [];
    const array = node.getChildren();
    for (let i = 0; i < array.length(); i++) {
      const nodePtr = array.get(i);
      children.push({ node: nodePtr, name: nodePtr.getNodeName() });
    }

    if (handle !== "-1" || children.length) this.setState({ handle, children });
  }

  toggle = (expanded) => this.setState({ expanded });

  highlight = (active) => this.setState({ highlight: active });

  select = (node) => {
    const highlightNodes = new this.context.lib.OdTvSelectionSet();
    const activeView = this.context.viewer.activeView;
    collectHighlightNodes(node, activeView, highlightNodes);

    this.context.viewer.setSelected(highlightNodes);
    this.context.viewer0.update();
    this.context.viewer0.emitEvent({ type: "select", data: highlightNodes });

    this.highlight(true);
    this.context.selected.push(this);
    this.context.handleToSelectedSet.add(this.state.handle);
  };

  zoomTo = () => {
    this.context.onAction("Zoom To");
  };

  render() {
    const { node, name } = this.props;
    const { handle, children, expanded, highlight } = this.state;
    const canClick = handle !== "-1" || children.length;
    return (
      <React.Fragment>
        <div
          className={classNames("d-flex", {
            "cursor-pointer": canClick,
            active: highlight,
          })}
          onClick={() => canClick && this.select(node)}
          onDoubleClick={() => canClick && this.zoomTo()}
        >
          <CDANodeArrowIcon hasChildren={children.length} expanded={expanded} onClick={this.toggle} />
          <span>{name}</span>
        </div>
        {expanded && (
          <ul>
            {children.map((x, index) => (
              <li key={index}>
                <CDANode node={x.node} name={x.name} />
              </li>
            ))}
          </ul>
        )}
      </React.Fragment>
    );
  }
}

CDANode.contextType = ObjectExplorerContext;

// old style tree view

class Iterator extends Component {
  constructor(props) {
    super(props);
    this.state = { children: [], expanded: false };
  }

  componentDidMount() {
    const { type, pointer, func } = this.props;
    const itr = pointer[func]();
    const handler = iterators[type];
    if (handler) {
      const children = [];
      for (let i = 0; !itr.done() && i < 100; itr.step(), i++) {
        const pointer = handler.pointer(itr);

        let name = pointer.getName ? pointer.getName() : "";
        if (!name) name = handler.getName ? handler.getName(pointer) : "";
        if (!name) name = pointer.$$.ptrType.registeredClass.name;

        const id = handler.id ? handler.id(itr, this.context.viewer.activeView) : null;

        if (name !== "$M_View_0_WCS_MODEL" && name !== "$FOR_EFFECT") {
          children.push({ pointer, name, id });
        }
      }
      this.setState({ children });
    } else {
      console.log("Skipped unknown object type", type);
    }
  }

  componentWillUnmount() {
    this.state.children.forEach((x) => x.pointer?.delete?.());
  }

  toggle = (expanded) => this.setState({ expanded });

  select = (id) => {
    if (id) {
      this.context.viewer.setSelectedEntity(id);
      this.context.viewer0.update();
      this.context.viewer0.emitEvent({ type: "select", data: this.context.viewer.getSelected() });
    }
  };

  render() {
    const { type } = this.props;
    const { children, expanded } = this.state;
    return (
      <div>
        <div className="d-flex cursor-pointer">
          <CDANodeArrowIcon hasChildren={children.length} expanded={expanded} onClick={this.toggle} />
          <span>{type}</span>
        </div>
        {expanded && (
          <ul>
            {children.map((x, index) => (
              <li key={index}>
                <OdNode pointer={x.pointer} name={x.name} onClick={() => this.select(x.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

Iterator.contextType = ObjectExplorerContext;

class CDAChildrenIterator {
  constructor(pointer) {
    this.pointer = pointer;
    this.index = 0;
  }

  done() {
    return !(this.index < this.pointer.length());
  }

  step() {
    this.index++;
  }

  current() {
    return this.done() ? null : this.pointer.get(this.index);
  }
}

class OdNode extends Component {
  constructor(props) {
    super(props);
    this.state = { children: [], expanded: false };
  }

  componentDidMount() {
    const { pointer, showCDA } = this.props;
    if (pointer) {
      let children = [];
      if (pointer.getChildren) {
        const dummy = {
          getChildrenIterator: () => new CDAChildrenIterator(pointer.getChildren()),
        };
        children.push({ pointer: dummy, func: "getChildrenIterator", type: "children" });
      } else {
        children = Object.keys(pointer.__proto__)
          .filter((key) => /get\w+Iterator/gi.test(key))
          .map((key) => {
            const regex = /get(\w+)Iterator/gi;
            const type = regex.exec(key)[1];
            return { pointer, func: key, type };
          })
          .filter((x) => !!showCDA === (x.type === "CDATree"));
      }
      this.setState({ children });
    }
  }

  toggle = (expanded) => this.setState({ expanded });

  render() {
    const { name, isRoot, onClick } = this.props;
    const { children, expanded } = this.state;
    return (
      <div>
        {!isRoot && (
          <div className="d-flex cursor-pointer" onClick={onClick}>
            <CDANodeArrowIcon hasChildren={children.length} expanded={expanded} onClick={this.toggle} />
            <span>{name}</span>
          </div>
        )}
        {(expanded || isRoot) && (
          <ul>
            {children.map((x, index) => (
              <li key={index}>
                <Iterator pointer={x.pointer} func={x.func} type={x.type} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

OdNode.contextType = ObjectExplorerContext;

export default ObjectExplorer;
