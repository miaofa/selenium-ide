import { action, computed, observable, observe } from "mobx";
import browser from "webextension-polyfill";
import SuiteState from "./SuiteState";

class UiState {
  @observable selectedTest = {};
  @observable selectedCommand = null;
  @observable filterTerm = "";
  @observable dragInProgress = false;
  @observable clipboard = null;
  @observable isRecording = false;
  @observable isSelectingTarget = false;
  @observable consoleHeight = 200;
  @observable minConsoleHeight = 200;
  @observable minContentHeight = 460;

  constructor() {
    this.suiteStates = {};
    this.filterFunction = this.filterFunction.bind(this);
    browser.storage.local.get().then(storage => {
      if (storage.consoleSize && storage.consoleSize >= this.minConsoleHeight) {
        this.resizeConsole(storage.consoleSize);
      }
    });
  }

  @action.bound setProject(project) {
    this._project = project;
    observe(this._project, "id", this.projectChanged);
  }

  @computed get filteredTests() {
    return this._project.tests.filter(this.filterFunction);
  }

  @computed get baseUrl() {
    return this._project.url;
  }

  @action.bound copyToClipboard(item) {
    this.clipboard = item;
  }

  @action.bound selectTest(test, suite) {
    this.selectedTest = { test, suite };
  }

  @action.bound selectCommand(command) {
    this.selectedCommand = command;
  }

  @action.bound changeFilter(term) {
    this.filterTerm = term;
  }

  @action.bound setDrag(dragProgress) {
    this.dragInProgress = dragProgress;
  }

  @action.bound toggleRecord() {
    this.isRecording = !this.isRecording;
  }

  @action.bound setSelectingTarget(isSelecting) {
    this.isSelectingTarget = isSelecting;
  }

  @action.bound resizeConsole(height) {
    this.consoleHeight = height;
    browser.storage.local.set({
      consoleSize: height 
    });
  }

  addStateForSuite(suite) {
    this.suiteStates[suite.id] = new SuiteState(this, suite);
  }

  filterFunction({name}) {
    return (name.indexOf(this.filterTerm) !== -1);
  }

  setUrl(url, addToCache) {
    this._project.setUrl(url);
    if (addToCache) this._project.addUrl(url);
  }

  @action.bound projectChanged() {
    this.selectedTest = {};
    this.selectedCommand = null;
    this.filterTerm = "";
    this.dragInProgress = false;
    this.clipboard = null;
    this.isRecording = false;
    this.suiteStates = {};
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
