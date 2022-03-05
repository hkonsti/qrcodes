import React from "react";
import "./App.css";
import {QrScanner} from "./QrScanner";
import {Camera} from "./Camera";
import {OpenCV} from "./opencv/OpenCV";

enum Runner {
	RUNNING,
	STOPPING,
	STOPPED,
}

interface AppState {
	scanner: QrScanner;
	camera: Camera;
}

export default class App extends React.Component<{}, AppState> {

	constructor(props: any) {
		super(props);

		this.state = {
			scanner: new QrScanner(),
			camera: new Camera(),
		};
	}

	async componentDidMount() {
		const videoElement = document.getElementById("webcam") as HTMLVideoElement;
		await this.state.camera.setUpStream(videoElement);

		const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
		if (!this.state.scanner.isInitialized) {
			await this.state.scanner.initialize(videoElement);
		}

		this.startRunner();
	}

	async startRunner() {
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
		await this.state.scanner.findFIPs(canvasElement);
	}

	render() {
		return (
			<div className="App">
				<video id="webcam" autoPlay={true} playsInline={true} width={640} height={480} style={{display: "none"}}></video>
				<canvas id="canvas" className="d-none"></canvas>
				<button onClick={this.takePhoto.bind(this)}>Heyy</button>
			</div>
		);
	}
}
