import ClientFactory from "../../ClientFactory";

export class FileModelContext {
  constructor(fileId) {
    this._fileId = fileId;
  }

  async initialize() {
    this._file = await ClientFactory.get().getFile(this._fileId);
    return this;
  }

  getHaveProperties() {
    return this._file.propertiesStatus === "done";
  }

  searchProperties(searchPattern) {
    return this._file.searchProperties(searchPattern);
  }

  getModels() {
    return this._file.getModels();
  }

  getPropertiesByHandle(handle) {
    return this._file.getProperties(handle);
  }

  getType() {
    return this._file.type;
  }

  get() {
    return this._file;
  }

  getContextType() {
    return "file";
  }

  isSupportViewPoint() {
    return true;
  }

  isSupportTransform() {
    return false;
  }

  isSupportSearch() {
    return true;
  }

  isSupportValidate() {
    return [".ifc", ".ifczip"].includes(this.getType());
  }
}
