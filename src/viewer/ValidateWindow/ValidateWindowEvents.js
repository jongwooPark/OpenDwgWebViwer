import { Subject } from "rxjs";

export class ValidateWindowEvents {
  constructor() {
    this.onEntitySelect = new Subject();
  }
}
