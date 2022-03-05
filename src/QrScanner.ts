import {OpenCV} from "./opencv/OpenCV";

export class QrScanner {

	static readonly PATH: string = "CASCADE_FILE";
	static readonly FILE: string = "./cv/cascade_selftrained_8.xml";

	isInitialized: boolean = false;

	src: any;
	dst: any;
	gray: any;
	cap: any;
	fips: any;
	classifier: any;

	private async waitForFile(path: string, url: string): Promise<void> {
		return new Promise((res, rej) => {
			let utils = new Utils("errorMessage");
			utils.createFileFromUrl(path, url, () => {
				res();
			});
		});
	}

	public async initialize(video: HTMLVideoElement): Promise<void> {
		if (!OpenCV.isOpenCVLoaded()) {
			await OpenCV.loadOpenCV();
			await this.waitForFile(QrScanner.PATH, QrScanner.FILE);
		} else {
			console.log("OpenCV is already loaded, skipping.");
		}

		this.classifier = new cv.CascadeClassifier();
		this.classifier.load(QrScanner.PATH);

		this.src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
		this.dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
		this.gray = new cv.Mat();
		this.cap = new cv.VideoCapture(video);
		this.fips = new cv.RectVector();

		this.isInitialized = true;
	}

	public async uninitialize() {
		this.classifier.delete();
		this.src.delete();
		this.dst.delete();
		this.gray.delete();
		this.fips.delete();
		this.isInitialized = false;
	}

	public async findFIPs(output: HTMLCanvasElement): Promise<void> {
		if (!this.isInitialized) {
			throw new Error("QrScanner needs to be initialized first.");
		}

		this.cap.read(this.src);
		this.src.copyTo(this.dst);
		cv.cvtColor(this.dst, this.gray, cv.COLOR_RGBA2GRAY, 0);
		this.classifier.detectMultiScale(this.gray, this.fips, 1.1, 3, 0);

		for (let i = 0; i < this.fips.size(); ++i) {
			let fip = this.fips.get(i);
			let p1 = new cv.Point(fip.x, fip.y);
			let p2 = new cv.Point(fip.x + fip.width, fip.y + fip.height);
			cv.rectangle(this.dst, p1, p2, [255, 0, 0, 255]);
		}

		cv.imshow(output, this.dst);
	}
}