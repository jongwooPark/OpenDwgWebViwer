import { Subject } from "rxjs";

export class ObjectExplorerEvents {
  constructor() {
    this.onEntitySelect = new Subject();
  }
}
