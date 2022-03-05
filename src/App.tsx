import React from "react";
import "./App.css";
import {Camera} from "./Camera";

import Runner from "./Runner";

export enum RunnerState {
	RUNNING,
	STOPPING,
}

interface AppState {
	camera: Camera;
	runners: {[x: string]: RunnerState};
}

export default class App extends React.Component<{}, AppState> {
	constructor(props: any) {
		super(props);

		this.state = {
			camera: new Camera(),
			runners: {},
		};
	}

	async componentDidMount() {
		const videoElement = document.getElementById("webcam") as HTMLVideoElement;
		await this.state.camera.setUpStream(videoElement);
	}

	registerRunner(id: string) {
		const runners = Object.keys(this.state.runners);
		runners.forEach(runner => {
			this.state.runners[runner] = RunnerState.STOPPING;
		});

		this.state.runners[id] = RunnerState.RUNNING;
	}

	unregisterRunner(id: string) {
		delete this.state.runners[id];
		console.log(`Runner ${id} unregistered.`);
	}

	getRunnerState(id: string): RunnerState | undefined {
		return this.state.runners[id];
	}

	render() {
		return (
			<div className="App">
				<video id="webcam" autoPlay={true} playsInline={true} width={640} height={480} style={{display: "none"}}></video>
				<canvas id="canvas" className="d-none"></canvas>
				<Runner
					registerRunner={this.registerRunner.bind(this)}
					unregisterRunner={this.unregisterRunner.bind(this)}
					getRunnerState={this.getRunnerState.bind(this)}>
				</Runner>
			</div>
		);
	}
}
