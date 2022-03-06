import React from "react";

import {RunnerState} from "./App";
import {QrScanner} from "./scanner/QrScanner";

interface Props {
    registerRunner: (id: string) => void;
    unregisterRunner: (id: string) => void;
    getRunnerState: (id: string) => RunnerState | undefined;
}

interface State {
    id: string;
}

/**
 * This component is a wrapper around the QrScanner class. It renders a div and is therefore
 * part of React's component tree and subject to hot reloading. When something is changed in this
 * file or in QrScanner.ts, this component is destroyed by React and replaced with the new version.
 * 
 * The `startRunner` function is an asynchronous loop that is detached and runs in the background. 
 * It is therefore not controlled by React. This means that orphaned infinite loops will still render 
 * to the canvas even if their "parent" components have long been replaced.
 * 
 * As a solution, old. outdated Runner instances are now tracked in the parent component, (App.tsx). 
 * When a Runner is replaced, the new instance notifies App.tsx if it's existance which then stops 
 * the old loop.
 */
export default class Runner extends React.Component<Props, State>{

    scanner: QrScanner = new QrScanner();

    constructor(props: Props) {
        super(props);

        let foundId = false;
        do {
            const id = this.generateRandomString();
            const state = this.props.getRunnerState(id);
            if (!state) {
                foundId = true;
                this.state = {
                    id: this.generateRandomString()
                };
            }
        } while (!foundId);
    }

	generateRandomString(): string {
		let out = "";
		const opt = "abcdefghijklmnopqrstuvwxyz";

		for (let i = 0; i < 16; i++) {
			out += opt[Math.floor(Math.random() * opt.length)];
		}

		return out;
	}

    async componentDidMount() {
        const videoElement = document.getElementById("webcam") as HTMLVideoElement;
        if (!this.scanner.isInitialized) {
            await this.scanner.initialize(videoElement);
        }

        this.props.registerRunner(this.state.id);
        const promise = this.startRunner();
        console.log(`Started Runner with ID: ${this.state.id}`);
    }

    async startRunner() {
        while (this.props.getRunnerState(this.state.id) === RunnerState.RUNNING) {
            await this.takePhoto();
            await this.sleep(10);
        };

        this.scanner.uninitialize();
        console.log(`Stopped Runner with ID: ${this.state.id}`);
        this.props.unregisterRunner(this.state.id);
    }

    async sleep(ms: number) {
        return new Promise((res, _) => {
            setTimeout(res, ms);
        });
    }

    async takePhoto() {
        const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
        this.scanner.scan(canvasElement);
    }

    render() {
        return (<div></div>);
    }
}