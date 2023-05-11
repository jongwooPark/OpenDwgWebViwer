import { Subject } from "rxjs";

export class HeaderComponentEvent {
  constructor() {
    this.changeEnable = new Subject();
    this.changeFileInfo = new Subject();
    this.changeModelList = new Subject();
    this.changeEnableObjectExplorer = new Subject();
    this.changeEnableProperties = new Subject();
    this.changeSupportViewPoint = new Subject();
    this.changeSupportTransform = new Subject();
    this.changeSupportSearch = new Subject();
    this.changeSupportValidate = new Subject();

    this.onOpenHighlightSettings = new Subject();
    this.onOpenViewpointView = new Subject();
    this.onOpenObjectExplorer = new Subject();
    this.onOpenProperties = new Subject();
    this.onOpenSearchWindow = new Subject();
    this.onOpenValidateWindow = new Subject();

    this.onOpenModel = new Subject();
    this.onOpenEdit = new Subject();
    this.onOpenError = new Subject();
  }
}
