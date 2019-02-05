import { observable, computed, action } from 'mobx';

export default class State {
  @observable canvas;
  @action.bound
  updateCanvas(element) {
    this.canvas = element;
  }
  @observable context;
  @action.bound
  updateContext(context) {
    this.context = context;
  }
  @observable prevMouseCoord = {
    x: 0,
    y: 0
  };
  @action.bound
  updatePrevMouseCoord(x, y) {
    this.prevMouseCoord.x = x;
    this.prevMouseCoord.y = y;
  }
  @observable
  canvasSize = { w: 280, h: 280 };
  @action.bound
  updateCanvasSize(w, h) {
    this.canvasSize.w = w;
    this.canvasSize.h = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }
  @observable
  result = Array.from(new Array(10)).map((e, i) => {
    return '-';
  });
  @action.bound
  updateResult(array) {
    this.result = array;
  }
  @action.bound
  resetResult() {
    this.result = Array.from(new Array(10)).map((e, i) => {
      return '-';
    });
  }
  @observable resultRenderEvent = false;
  @action.bound
  updateResultRenderEvent(bool) {
    this.resultRenderEvent = bool;
  }
}
