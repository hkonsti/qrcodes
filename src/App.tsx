import React from 'react';
import "./App.css";
import { QrScanner } from './QrScanner';

interface AppState {
  activeCamera: number,
  errorMessage: string,
}

export default class App extends React.Component<{}, AppState> {

  scanner: QrScanner;

  constructor(props: any) {
    super(props);

    this.state = {
      activeCamera: -1,
      errorMessage: "",
    };

    this.scanner = new QrScanner();
  }

  async componentDidMount() {
    // permission
    // github guy does it differently
    // https://github.com/bensonruan/webcam-easy/blob/0ebfea62fec456c9b618d5f17c72386124e753b5/dist/webcam-easy.js#L49
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});

    // get all devices
    const devices = await navigator.mediaDevices.enumerateDevices();

    // iterate and only grab video devices
    const videoDevies = [];
    devices.forEach(device => {
      if (device.kind === "videoinput") {
        videoDevies.push(device);
      }
    });

    if (videoDevies.length < 1) {
      this.setState({
        errorMessage: "Device doesn't have a camera.",
      })
      return;
    }

    // get current webcam id
    this.setState({activeCamera: 0});
    const deviceId = devices[this.state.activeCamera].deviceId;

    // get dom elements to project on
    const videoElement = document.getElementById("webcam") as HTMLVideoElement;

    videoElement.srcObject = stream;
    videoElement.play();

    this.setUpRunner();
  }

  async setUpRunner() {
    while(true) {
      await this.takePhoto();
      await this.sleep(10);
    }
  }

  async sleep(ms: number) {
    return new Promise((res, rej) => {
      setTimeout(res, ms);
    });
  }

  async takePhoto() {
    const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    const videoElement = document.getElementById("webcam") as HTMLVideoElement;

    canvasElement.height = videoElement.height;
    canvasElement.width = videoElement.width;
    const context = canvasElement.getContext("2d");
    context!.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context!.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    await this.scanner.scan(canvasElement);
  }

  render() {
    return (
      <div className="App">
        {this.state.errorMessage}
        <video id="webcam" autoPlay={true} playsInline={true} width={640} height={480}></video>
        <canvas id="canvas" className="d-none"></canvas>
        <button onClick={this.takePhoto}>
          Take photo
        </button>
        <input type="file" id="fileInput" />
      </div>
    );
  }
}
