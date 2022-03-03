import injectScript from "./injectScript";

const OPENCV = "http://localhost:3000/cv/opencv.js";
const OPENCV_UTILS = "http://localhost:3000/cv/utils.js";

export class OpenCV {

    static async loadOpenCV(): Promise<void> {
        return new Promise(async (res, rej) => {
            await injectScript("opencv-injected", OPENCV);
            await injectScript("opencv-utils-injected", OPENCV_UTILS);
            cv["onRuntimeInitialized"] = () => {
                res();
            }
            setTimeout(() => {
                rej("OpenCV took too long to initialize.");
            }, 5000);
        });
    }

    static unloadOpenCV() {
        // TODO: not needed as of right now since the whole app is using OpenCV
    }

}

