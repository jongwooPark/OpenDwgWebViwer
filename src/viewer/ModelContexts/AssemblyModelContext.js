import ClientFactory from "../../ClientFactory";

export class AssemblyModelContext {
  constructor(assemblyId) {
    this._assemblyId = assemblyId;
  }

  async initialize() {
    this._assembly = await ClientFactory.get().getAssembly(this._assemblyId);
    return this;
  }

  getHaveProperties() {
    return true;
  }

  searchProperties(searchPattern) {
    return this._assembly.searchProperties(searchPattern);
  }

  getModels() {
    return this._assembly.getModels();
  }

  getPropertiesByHandle(handle) {
    return this._assembly.getProperties(handle);
  }

  getType() {
    return "";
  }

  get() {
    return this._assembly;
  }

  getContextType() {
    return "assembly";
  }

  isSupportViewPoint() {
    return false;
  }

  isSupportTransform() {
    return true;
  }

  isSupportSearch() {
    return false;
  }

  isSupportValidate() {
    return false;
  }
}
