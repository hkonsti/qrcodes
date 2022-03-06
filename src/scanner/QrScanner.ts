import {OpenCV} from "../opencv/OpenCV";
import {Aggregator, Edge, QrCode} from "./Aggregator";

import {Geometry, Rectangle} from "./Geometry";

export class QrScanner {

	private static readonly PATH: string = "CASCADE_FILE";
	private static readonly FILE: string = "./cv/cascade_selftrained_8.xml";

	public isInitialized: boolean = false;

	private src: any;
	private dst: any;
	private gray: any;
	private cap: any;
	private fips: any;
	private classifier: any;

	private aggregator = new Aggregator();
	private geometry = new Geometry();

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

	public scan(output: HTMLCanvasElement) {
		if (!this.isInitialized) {
			throw new Error("QrScanner needs to be initialized first.");
		}

		this.cap.read(this.src);
		this.src.copyTo(this.dst);

		const fips = this.findFIPs();
		const edges = this.aggregator.findEdges(fips);
		this.drawSearchPositions(edges);

		const qrCode = this.aggregator.checkPositioning(edges);
		if (qrCode) {
			this.drawQrCodeEdges(qrCode);
		}

		cv.imshow(output, this.dst);
	}

	private findFIPs(): Rectangle[] {
		cv.cvtColor(this.dst, this.gray, cv.COLOR_RGBA2GRAY, 0);
		this.classifier.detectMultiScale(this.gray, this.fips, 1.1, 3, 0);

		const rectangles: Rectangle[] = [];

		for (let i = 0; i < this.fips.size(); ++i) {
			let fip = this.fips.get(i);
			rectangles.push({
				point: {
					x: fip.x,
					y: fip.y,
				},
				height: fip.height,
				width: fip.width,
			});

			let p1 = new cv.Point(fip.x, fip.y);
			let p2 = new cv.Point(fip.x + fip.width, fip.y + fip.height);
			cv.rectangle(this.dst, p1, p2, [255, 0, 0, 255]);
		}

		return rectangles;
	}

	private drawSearchPositions(edges: Edge[]) {
		for (const edge of edges) {
			const positions = this.aggregator.getPossiblePositions(this.geometry.findMiddleOfRectangle(edge[0]), this.geometry.findMiddleOfRectangle(edge[1]));
			for (const position of positions) {
				const rectAround = this.geometry.squareAroundPoint(position, 10);
				const p1 = new cv.Point(rectAround.point.x, rectAround.point.y);
				const p2 = new cv.Point(rectAround.point.x + rectAround.width,
										rectAround.point.y + rectAround.height);
				cv.rectangle(this.dst, p1, p2, [255, 255, 0, 255]);
			}
		}
	}

	private drawQrCodeEdges(qrCode: QrCode) {
		const middle1 = this.geometry.findMiddleOfRectangle(qrCode[0]);
		const middle2 = this.geometry.findMiddleOfRectangle(qrCode[1]);
		const middle3 = this.geometry.findMiddleOfRectangle(qrCode[2]);

		const p1 = new cv.Point(middle1.x, middle1.y);
		const p2 = new cv.Point(middle2.x, middle2.y);
		const p3 = new cv.Point(middle3.x, middle3.y);
		cv.line(this.dst, p1, p2, [0,255,0,255], 5);
		cv.line(this.dst, p2, p3, [0,255,0,255], 5);
		cv.line(this.dst, p3, p1, [0,255,0,255], 5);
	}
}