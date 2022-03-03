import React from "react";
import "./App.css";
import {QrScanner} from "./QrScanner";
import {Camera} from "./Camera";

export default class App extends React.Component<{}, {}> {

	scanner: QrScanner;
	camera: Camera;

	constructor(props: any) {
		super(props);

		this.scanner = new QrScanner();
		this.camera = new Camera();
	}

	async componentDidMount() {
		const videoElement = document.getElementById("webcam") as HTMLVideoElement;
		await this.camera.setUpStream(videoElement);

		this.setUpRunner();
	}

	async setUpRunner() {
		while (true) {
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

		this.camera.drawImageOnCanvas(canvasElement, videoElement);

		await this.scanner.scan(canvasElement);
	}

	render() {
		return (
			<div className="App">
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
