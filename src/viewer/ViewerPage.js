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
import classNames from "classnames";
import { Viewer as OdaViewer } from "open-cloud-client";

import ProgressBar from "../components/ProgressBar";
import { VisualizeProgress } from "./VisualizeJSProgress";
import ClientFactory from "../ClientFactory";
import Draggers from "./Draggers";
import { RED_COLOR } from "../components/ColorSelector";
import HeaderComponent from "./HeaderComponent/HeaderComponent";
import { HeaderComponentEvent } from "./HeaderComponent/HeaderComponentEvent";
import { ViewpointListEvent } from "./ViewpointListComponent/ViewpointListEvent";
import { ViewpointListComponent } from "./ViewpointListComponent/ViewpointListComponent";
import { PropertiesComponent } from "./PropertiesComponent/PropertiesComponent";
import { PropertiesEvent } from "./PropertiesComponent/PropertiesEvent";
import ContextMenu from "./ContextMenu";
import ObjectExplorer from "./ObjectExplorer/ObjectExplorer";
import { ObjectExplorerEvents } from "./ObjectExplorer/ObjectExplorerEvents";
import { SearchWindowComponent } from "./SearchWindowComponent/SearchWindowComponent";
import { ValidateWindow } from "./ValidateWindow/ValidateWindow";
import { ValidateWindowEvents } from "./ValidateWindow/ValidateWindowEvents";
import { SubscribeSubjectContext } from "../utils/SubscribeSubjectContext";
import { ModelContextFactory } from "./ModelContexts/ModelContextFactory";
import { AssemblyTransformComponent } from "./AssemblyTransformComponent/AssemblyTransformComponent";
import { WalkHelperComponent } from "./WalkHelperComponent/WalkHelperComponent";
import { AppContext } from "../AppContext";
import { HighlightSettings } from "./HighlightSettings/HighlightSettings";
import { routeAdapter } from "../adapters/routeAdapter";

import "./ViewerPage.css";

function ActionsLoadIndicator({ loading }) {
  return <div className={classNames("actions-spinner", "spinner-border", loading ? "" : "d-none")} role="status" />;
}

let showWalkHelp = true;

class Viewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modelList: [],
      activeModel: null,
      file: null,
      geometryProgress: 0,
      visualizeProgress: 0,
      databaseLoaded: false,
      geometryLoaded: false,
      isSupportViewpoints: false,
      isCDA: false,
      is3D: false,
      activeDragger: "",
      markupColor: RED_COLOR,
      explodeIndex: 0,
      isVisibleHighlightSettings: false,
      isVisibleObjectExplorer: false,
      isVisibleProperties: false,
      isVisibleViewPointView: false,
      isVisibleTransformView: false,
      isVisibleSearchWindow: false,
      isVisibleValidateWindow: false,
      isVisibleWalkHelp: false,
      isVisibleLoadIndicator: false,
    };

    this.subscribeSubjectContext = new SubscribeSubjectContext();
    this.connectHeaderComponentEvents();
    this.connectViewpointListComponentEvents();
    this.connectPropertiesEvents();

    this.objectExplorerEvents = new ObjectExplorerEvents();
    this.validateWindowEvents = new ValidateWindowEvents();
  }

  toggle = (name) => () => this.setState({ [name]: !this.state[name] });

  connectPropertiesEvents() {
    this.propertiesEvents = new PropertiesEvent();
    this.subscribeSubjectContext.subscribe(this.propertiesEvents.onClose, () => this.toggle("isVisibleProperties")());
  }

  connectViewpointListComponentEvents() {
    this.viewpointListEvents = new ViewpointListEvent();

    this.subscribeSubjectContext.subscribe(this.viewpointListEvents.onClose, () =>
      this.toggle("isVisibleViewPointView")()
    );

    this.subscribeSubjectContext.subscribe(this.viewpointListEvents.onRemoveViewpoint, async (viewpoint) => {
      try {
        await this.state.activeModel.deleteViewpoint(viewpoint.guid);
        this.viewpointListEvents.deleteViewpoint.next(viewpoint);
        this.context.app.addNotification("success", "Viewpoint deleted");
      } catch (e) {
        console.error("Cannot delete viewpoint.", e);
        this.context.app.addNotification("error", "Cannot delete viewpoint");
      }
    });

    this.subscribeSubjectContext.subscribe(this.viewpointListEvents.onSelectViewpoint, (viewpoint) => {
      const { activeModel } = this.state;
      const { modelId } = viewpoint.custom_fields || {};
      if (activeModel && activeModel.id === modelId) this.viewer.drawViewpoint(viewpoint);
    });
  }

  connectHeaderComponentEvents() {
    this.headerEventsConnection = new HeaderComponentEvent();

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenModel, async (model) => {
      await this.openModel(model);
    });

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenObjectExplorer, () =>
      this.toggle("isVisibleObjectExplorer")()
    );

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenHighlightSettings, () =>
      this.toggle("isVisibleHighlightSettings")()
    );

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenProperties, () => {
      this.toggle("isVisibleProperties")();
      if (this.lastProperties) {
        setTimeout(() => {
          this.propertiesEvents.completeLoadProperties.next(this.lastProperties);
        }, 0);
      }
    });

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenViewpointView, async () => {
      const visibleViewPoint = this.state.isVisibleViewPointView;
      this.toggle("isVisibleViewPointView")();
      if (!visibleViewPoint) {
        await this.getViewpoints(this.state.activeModel);
      }
    });

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenEdit, () =>
      this.toggle("isVisibleTransformView")()
    );

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenSearchWindow, () =>
      this.toggle("isVisibleSearchWindow")()
    );

    this.subscribeSubjectContext.subscribe(this.headerEventsConnection.onOpenValidateWindow, () =>
      this.toggle("isVisibleValidateWindow")()
    );
  }

  connectViewerEvents() {
    this.viewer.addEventListener("walkspeedchange", (speed) => {
      this.context.app.addNotification("success", `Move speed ${speed.data}`);
    });

    this.viewer.addEventListener("select", async (ev) => {
      const sSet = ev.data;
      const itr = sSet.getIterator();
      let firstHandle = null;
      const selected = [];

      for (; !itr.done(); itr.step()) {
        const entityId = itr.getEntity();

        const obj =
          entityId.getType() === 1
            ? entityId.openObject()
            : entityId.getType() === 2
            ? entityId.openObjectAsInsert()
            : null;

        if (obj) {
          const handle = obj.getNativeDatabaseHandle();
          obj.delete();

          if (handle !== "-1") {
            selected.push(handle);
            if (!firstHandle) firstHandle = handle;
          }
        }
      }

      this.objectExplorerEvents.onEntitySelect.next(selected);
      this.validateWindowEvents.onEntitySelect.next(selected);

      if (firstHandle && this.modelContext.getHaveProperties()) {
        await this.getProperties(firstHandle);
      }
    });
  }

  async componentDidMount() {
    const contextFactory = new ModelContextFactory();
    const modelContext = contextFactory.create(this.props.match);
    await modelContext
      .initialize()
      .then((context) => (this.modelContext = context))
      .catch((e) => {
        console.error(`Cannot get ${modelContext.getContextType()} info.`, e);
        this.headerEventsConnection.onOpenError.next();
      });

    if (!this.modelContext) return;

    this.headerEventsConnection.changeFileInfo.next(this.modelContext.get());

    // Override visualizeJsUrl below (or in public/config.json) to use your
    // own VisualizeJS library URL, or leave it undefined or blank to use
    // the default URL defined by the Client.js you are using.
    //
    // Note: Your own VisualizeJS library version must match the version of
    // the Client.js you are using.

    const visualizeJsUrl = this.context.app.config.visualizejs_url;
    const viewer = new OdaViewer(ClientFactory.get(), { visualizeJsUrl });

    const canvas = document.getElementById("canvas");

    const progress = (event) => {
      const visualizeProgress = event.total > 0 ? ((100 * event.loaded) / event.total) | 0 : 0;
      this.setState({ visualizeProgress });
    };

    await viewer
      .initialize(canvas, progress)
      .then((viewer) => {
        this.viewer = viewer;
        this.connectViewerEvents();
      })
      .catch((e) => {
        console.error("Cannot load VisualizeJS.", e);
        this.headerEventsConnection.onOpenError.next();
        this.setState({ visualizeProgress: 0 });
      });

    if (!this.viewer) return;

    try {
      this.viewer.visViewer().setExperimentalFunctionalityFlag("gpu_select", false);

      const models = await this.modelContext.getModels();
      this.setState({ modelList: models });

      this.headerEventsConnection.changeModelList.next(models);

      const model = models.find((model) => model.default) || models[0];
      if (!model) throw new Error("No default model found");

      await this.openModel(model);
    } catch (e) {
      console.error("Cannot open model.", e);
      this.headerEventsConnection.onOpenError.next();
    }
  }

  componentWillUnmount() {
    this.viewer?.dispose();

    this.subscribeSubjectContext.unsubscribe();
  }

  getViewpoints = async (model) => {
    const viewpoints = await model
      .getViewpoints()
      .catch((error) => console.error("Cannot load model viewpoints.", error));
    this.viewpointListEvents.changeViewpoints.next(viewpoints);

    if (!viewpoints) return;

    for (const viewpoint of viewpoints) {
      await model
        .getSnapshot(viewpoint.guid)
        .then((snapshot) => {
          viewpoint.snapshot = { data: snapshot };
          this.viewpointListEvents.modifyViewpoint.next(viewpoint);
        })
        .catch((e) => console.error(`Cannot load snapshot for viewpoint ${viewpoint.description}.`, e));
    }
  };

  getProperties = async (handle) => {
    try {
      this.propertiesEvents.loadingProperties.next(true);
      const props = await this.modelContext.getPropertiesByHandle(handle);
      if (this.state.isVisibleProperties) {
        this.propertiesEvents.completeLoadProperties.next(props);
        this.lastProperties = null;
      } else {
        this.lastProperties = props;
      }
    } catch (e) {
      console.error("Cannot load properties.", e);
      this.propertiesEvents.errorLoadProperties.next(new Error("No properties found"));
    }
  };

  openModel = async (model) => {
    if (!this.viewer) return;

    try {
      this.viewer.cancel();

      this.setState({
        activeModel: model,
        databaseLoaded: false,
        geometryLoaded: false,
        is3D: false,
        isSupportViewpoints: this.modelContext.isSupportViewPoint(),
        activeDragger: "",
        isVisibleObjectExplorer: false,
        isVisibleHighlightSettings: false,
      });

      this.headerEventsConnection.changeEnableProperties.next(false);
      this.headerEventsConnection.changeEnableObjectExplorer.next(false);
      this.headerEventsConnection.changeEnable.next(false);
      this.headerEventsConnection.changeSupportViewPoint.next(this.modelContext.isSupportViewPoint());
      this.headerEventsConnection.changeSupportTransform.next(this.modelContext.isSupportTransform());
      this.headerEventsConnection.changeSupportSearch.next(this.modelContext.isSupportSearch());
      this.headerEventsConnection.changeSupportValidate.next(this.modelContext.isSupportValidate());

      const geometryProgress = (event) => {
        this.setState({ geometryProgress: event.data });
      };

      const databaseChunk = () => {
        this.setState({ databaseLoaded: true });
        this.handleChangeDragger("Pan");

        this.headerEventsConnection.changeEnable.next(true);
        this.headerEventsConnection.changeEnableProperties.next(this.modelContext.getHaveProperties());
      };

      this.viewer.addEventListener("geometryprogress", geometryProgress);
      this.viewer.addEventListener("databasechunk", databaseChunk);

      await this.viewer.loadReferences(model);
      await this.viewer.open(model);

      this.viewer.removeAllListeners("databasechunk");
      this.viewer.removeAllListeners("geometryprogress");

      const visViewer = this.viewer.visViewer();
      if (visViewer) {
        const isCDA = !visViewer.getCDATreeIterator().done();
        const is3D = this.viewer.is3D();
        this.setState({ geometryLoaded: true, isCDA, is3D });

        const type = this.modelContext.getType();
        if ([".obj", ".ifc", ".ifczip"].includes(type)) visViewer.setBackgroundColor([255, 255, 255]);

        this.headerEventsConnection.changeEnableObjectExplorer.next(isCDA);
      }
    } catch (e) {
      console.error("Cannot open model.", e);
    }

    if (this.state.isVisibleViewPointView) await this.getViewpoints(model);
  };

  handleChangeDragger = async (dragger) => {
    const clearSlices = () => {
      this.viewer.clearSlices();
      setDragger("Pan");
    };

    const clearMarkup = () => {
      this.viewer.clearOverlay();
    };

    const saveViewpoint = () => {
      const viewpoint = this.viewer.createViewpoint();

      const modelId = this.state.activeModel.id;
      viewpoint.custom_fields = { ...viewpoint.custom_fields, modelId };

      const model = this.state.activeModel;
      model
        .saveViewpoint(viewpoint)
        .then((data) => {
          if (this.state.isVisibleViewPointView) {
            data.snapshot = viewpoint.snapshot;
            this.viewpointListEvents.addViewpoint.next(data);
          }
          this.context.app.addNotification("success", "Viewpoint saved");
        })
        .catch((e) => {
          console.error("Cannot save viewpoint.", e);
          this.context.app.addNotification("error", "Cannot save viewpoint");
        });
    };

    const setDragger = (dragger) => {
      this.setState({
        activeDragger: dragger,
        isVisibleWalkHelp: showWalkHelp && dragger === "Walk",
      });
      this.viewer.setActiveDragger(dragger);
      this.viewer.canvas.className = this.viewer.canvas.className
        .split(" ")
        .filter((x) => !x.startsWith("cursor-"))
        .concat([`cursor-${dragger.toLowerCase()}`])
        .join(" ");
    };

    if (dragger === "Clear Slices") clearSlices();
    else if (dragger === "Clear Markup") clearMarkup();
    else if (dragger === "Save Viewpoint") await saveViewpoint();
    else if (dragger === "Cutting");
    else if (dragger === "Markup");
    else setDragger(dragger);
  };

  handleChangeMarkupColor = (color) => {
    this.setState({ markupColor: color });
    this.viewer.setMarkupColor(color.r, color.g, color.b);
    this.viewer.colorizeAllMarkup(color.r, color.g, color.b);
  };

  execWithLoadIndicator = (cb) => {
    this.setState({ isVisibleLoadIndicator: true }, () => {
      setTimeout(() => {
        try {
          cb();
        } catch (e) {
          console.error(e);
        } finally {
          this.setState({ isVisibleLoadIndicator: false });
        }
      }, 10);
    });
  };

  handleAction = async (action) => {
    const zoomTo = () => {
      const visViewer = this.viewer.visViewer();
      const pSelected = visViewer.getSelected();
      if (!pSelected.isNull() && pSelected.numItems() > 0) {
        if (visViewer.zoomToObjects) {
          visViewer.zoomToObjects(pSelected);
          visViewer.update();
        } else {
          const itr = pSelected.getIterator();
          const entity = itr.getEntity();
          visViewer.zoomToEntity(entity);
          visViewer.update();
          itr.delete();
          entity.delete();
        }
      }
      pSelected.delete();
    };

    const unselect = () => {
      this.viewer.setSelected([]);
    };

    const isolate = () => {
      this.viewer.visViewer().isolateSelectedObjects(false);
      this.viewer.update(true);
    };

    const hide = () => {
      this.viewer.visViewer().hideSelectedObjects();
    };

    const showAll = () => {
      this.viewer.visViewer().unisolateSelectedObjects(false);
    };

    const explode = () => {
      const { explodeIndex } = this.state;
      this.setState({ explodeIndex: explodeIndex + 1 });
      this.viewer.visViewer().explode(explodeIndex + 1);
      this.viewer.update(true);
    };

    const collect = () => {
      this.setState({ explodeIndex: 0 });
      this.viewer.visViewer().explode(0);
      this.viewer.update(true);
    };

    const regenerate = () => {
      this.viewer.visViewer().regenAll();
      this.viewer.update(true);
    };

    const resetModel = () => {
      const { is3D } = this.state;
      this.handleChangeDragger("Pan");
      if (is3D) this.handleChangeDragger("Clear Slices");
      this.handleChangeDragger("Clear Markup");
      this.handleChangeMarkupColor(RED_COLOR);
      this.handleAction("Unselect");
      this.handleAction("Show All");
      if (is3D) this.handleAction("Collect");
      this.handleAction(is3D ? "k3DViewSW" : "Home");
      this.handleAction("Regenerate");
    };

    const updatePreview = () => {
      const canvas = this.viewer.visLib().canvas;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.25);

      const file = this.modelContext.get();
      file
        .setPreview(dataUrl)
        .then(() => {
          this.context.app.addNotification("success", "Preview updated");
        })
        .catch((e) => {
          console.error("Cannot update preview.", e);
          this.context.app.addNotification("error", "Cannot update preview");
        });
    };

    const home = () => {
      this.viewer.visViewer().zoomExtents();
      this.viewer.update(true);
    };

    const setViewPos = () => {
      const defViewPos = this.viewer.visLib().DefaultViewPosition;
      this.viewer.visViewer().setDefaultViewPositionWithAnimation(defViewPos[action]);
      this.viewer.update(true);
    };

    if (action === "Zoom To") zoomTo();
    else if (action === "Unselect") unselect();
    else if (action === "Isolate") this.execWithLoadIndicator(isolate);
    else if (action === "Hide") this.execWithLoadIndicator(hide);
    else if (action === "Show All") this.execWithLoadIndicator(showAll);
    else if (action === "Explode") this.execWithLoadIndicator(explode);
    else if (action === "Collect") this.execWithLoadIndicator(collect);
    else if (action === "Regenerate") this.execWithLoadIndicator(regenerate);
    else if (action === "Reset Model") resetModel();
    else if (action === "Update Preview") await updatePreview();
    else if (action === "Home") home();
    else if (action.startsWith("k3DView")) setViewPos();
  };

  render() {
    return (
      <div className="h-100 d-flex flex-column">
        <div>
          <ProgressBar progress={this.state.geometryProgress * 100} />
        </div>

        <HeaderComponent
          isAssembly={this.modelContext?.getContextType() === "assembly"}
          eventsConnection={this.headerEventsConnection}
        />

        <div className="viewer flex-grow-1 overflow-hidden">
          <ContextMenu
            viewer={this.viewer}
            disabled={!this.state.databaseLoaded}
            is3D={this.state.is3D}
            isSupportViewpoints={this.state.isSupportViewpoints}
            activeDragger={this.state.activeDragger}
            onClick={this.handleAction}
          >
            <canvas id="canvas" style={{ width: "100%", height: "100%" }} />
          </ContextMenu>

          {this.state.visualizeProgress && !this.viewer && <VisualizeProgress value={this.state.visualizeProgress} />}

          <Draggers
            viewer={this.viewer}
            disabled={!this.state.databaseLoaded}
            is3D={this.state.is3D}
            isSupportViewpoints={this.state.isSupportViewpoints}
            activeDragger={this.state.activeDragger}
            markupColor={this.state.markupColor}
            onChangeDragger={this.handleChangeDragger}
            onChangeMarkupColor={this.handleChangeMarkupColor}
            onAction={this.handleAction}
          />

          <ActionsLoadIndicator loading={this.state.isVisibleLoadIndicator} />
        </div>

        {this.viewer && (
          <HighlightSettings
            viewer={this.viewer}
            visible={this.state.isVisibleHighlightSettings}
            onClose={this.toggle("isVisibleHighlightSettings")}
          />
        )}

        {this.state.databaseLoaded && this.state.geometryLoaded ? (
          <ObjectExplorer
            viewer={this.viewer}
            visible={this.state.isVisibleObjectExplorer}
            events={this.objectExplorerEvents}
            isCDA={this.state.isCDA}
            onClose={this.toggle("isVisibleObjectExplorer")}
            onAction={this.handleAction}
          />
        ) : null}

        {this.state.isVisibleProperties ? <PropertiesComponent eventsConnection={this.propertiesEvents} /> : null}

        {this.state.isVisibleViewPointView ? (
          <ViewpointListComponent eventsConnection={this.viewpointListEvents} />
        ) : null}

        {this.state.isVisibleTransformView ? (
          <AssemblyTransformComponent
            viewer={this.viewer}
            assembly={this.modelContext.get()}
            onClose={this.toggle("isVisibleTransformView")}
          ></AssemblyTransformComponent>
        ) : null}

        <WalkHelperComponent
          visible={this.state.isVisibleWalkHelp}
          onClose={() => this.setState({ isVisibleWalkHelp: false })}
          onDontShow={(checked) => (showWalkHelp = !checked)}
        />

        {this.state.isVisibleSearchWindow && (
          <SearchWindowComponent
            viewer={this.viewer}
            context={this.context}
            modelContext={this.modelContext}
            onClose={this.toggle("isVisibleSearchWindow")}
          ></SearchWindowComponent>
        )}

        {this.state.isVisibleValidateWindow && (
          <ValidateWindow
            viewer={this.viewer}
            context={this.context}
            modelContext={this.modelContext}
            events={this.validateWindowEvents}
            onClose={this.toggle("isVisibleValidateWindow")}
          ></ValidateWindow>
        )}
      </div>
    );
  }
}

Viewer.contextType = AppContext;

export default routeAdapter(Viewer);
