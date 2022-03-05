import injectScript from "./injectScript";

export class OpenCV {

	static readonly OPENCV_ID = "opencv-injected";
	static readonly OPENCV_UTILS_ID = "opencv-utils-injected";

	static readonly OPENCV = "http://localhost:3000/cv/opencv.js";
	static readonly OPENCV_UTILS = "http://localhost:3000/cv/utils.js";

	static isOpenCVLoaded() {
		const opencv = document.getElementById(OpenCV.OPENCV_ID);
		return opencv !== null;
	}

	static async loadOpenCV(): Promise<void> {
		return new Promise(async (res, rej) => {
			await injectScript(OpenCV.OPENCV_ID, OpenCV.OPENCV);
			await injectScript(OpenCV.OPENCV_UTILS_ID, OpenCV.OPENCV_UTILS);
			cv["onRuntimeInitialized"] = () => {
				res();
			}
			setTimeout(() => {
				rej("OpenCV took too long to initialize.");
			}, 5000);
		});
	}

	static unloadOpenCV() {
		const script = document.getElementById(OpenCV.OPENCV_ID);
		if (script) {
			script.replaceWith();
		}
		const utils = document.getElementById(OpenCV.OPENCV_UTILS_ID);
		if (utils) {
			utils.replaceWith();
		}
	}

}

