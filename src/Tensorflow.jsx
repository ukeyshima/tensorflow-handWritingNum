import * as tf from '@tensorflow/tfjs';
import React from 'react';
import { inject, observer } from 'mobx-react';

@inject(({ state }) => ({
  updateCanvas: state.updateCanvas,
  updateContext: state.updateContext,
  canvas: state.canvas,
  context: state.context,
  prevMouseCoord: state.prevMouseCoord,
  updatePrevMouseCoord: state.updatePrevMouseCoord,
  updateCanvasSize: state.updateCanvasSize,
  canvasSize: state.canvasSize,
  result: state.result,
  updateResult: state.updateResult,
  resetResult: state.resetResult,
  resultRenderEvent: state.resultRenderEvent,
  updateResultRenderEvent: state.updateResultRenderEvent
}))
@observer
export default class Tensorflow extends React.Component {
  async componentDidMount() {
    const model = await tf.loadModel('./model/model.json');
    this.model = model;
    const canvas = this.canvas;
    this.props.updateCanvas(canvas);
    this.props.updateCanvasSize(280, 280);
    const context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    this.props.updateContext(context);
  }
  handleClick = () => {
    const canvas = this.props.canvas;
    const context = this.props.context;
    context.drawImage(
      canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      28,
      28
    );
    const imageData = context.getImageData(0, 0, 28, 28);
    const data = imageData.data;
    for (let i = 0; i < data.length / 4; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const gray = parseInt((r * 30 + g * 59 + b * 11) / 100);
      data[i * 4] = gray;
      data[i * 4 + 1] = gray;
      data[i * 4 + 2] = gray;
    }
    let tensorData = tf.fromPixels(imageData, 1);
    tensorData = tensorData.div(255);
    tensorData = tensorData.reshape([1, 28, 28, 1]);
    const prediction = this.model.predict(tensorData);
    this.props.updateResult(Array.from(prediction.dataSync()));
    this.props.updateResultRenderEvent(true);
  };
  handleClear = () => {
    const canvas = this.props.canvas;
    const context = this.props.context;
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    this.props.resetResult();
    this.props.updateResultRenderEvent(false);
  };
  handleMouseDown = e => {
    const context = this.props.context;
    context.strokeStyle = '#fff';
    context.lineWidth = 10;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    this.props.updatePrevMouseCoord(
      e.pageX - e.target.getBoundingClientRect().left,
      e.pageY - e.target.getBoundingClientRect().top
    );
    this.mouseDown = true;
  };
  handleMouseMove = e => {
    if (this.mouseDown) {
      const x = e.pageX - e.target.getBoundingClientRect().left;
      const y = e.pageY - e.target.getBoundingClientRect().top;
      const prev = this.props.prevMouseCoord;
      const context = this.props.context;
      context.beginPath();
      context.moveTo(prev.x, prev.y);
      context.lineTo(x, y);
      context.stroke();
      context.closePath();
      this.props.updatePrevMouseCoord(x, y);
    }
  };
  handleMouseUp = () => {
    this.mouseDown = false;
  };
  render() {
    const data = this.props.result;
    const max = data.reduce((curr, prev) => (curr > prev ? curr : prev));
    const maxIndex = data.indexOf(max);
    return (
      <div style={{ margin: 20 }}>
        <div style={{ width: 350 }}>
          <canvas
            style={{
              width: this.props.canvasSize.w,
              height: this.props.canvasSize.h,
              border: 'double 1px #000'
            }}
            ref={e => {
              this.canvas = e;
            }}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
          />
          <button onClick={this.handleClick}>Prediction</button>
          <button onClick={this.handleClear}>Clear</button>
        </div>
        <div>
          {data.map((e, i) => {
            return (
              <div
                style={{
                  width: 350,
                  height: 30,
                  fontSize: 20,
                  backgroundColor: !this.props.resultRenderEvent
                    ? '#eee'
                    : i === maxIndex
                    ? '#88e'
                    : '#eee'
                }}
                key={i}
              >{`${i}:${e}`}</div>
            );
          })}
        </div>
      </div>
    );
  }
}
