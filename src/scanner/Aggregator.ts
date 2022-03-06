import {Rectangle, Geometry, Point} from "./Geometry";

type QrCode = [Rectangle, Rectangle, Rectangle];
type Edge = [Rectangle, Rectangle];

/**
 * The Aggregator class is used to chose which finding patterns belong to a QR code.
 */
export class Aggregator {

	static readonly DISTANCE_THRESHOLD = 100;
	static readonly SIZE_DIFFERENCE_THRESHOLD = 0.5 // percent deviation from smaller one

	static readonly LOCATION_TOLERANCE = 50;

	geometry = new Geometry();

	public findEdges(squares: Rectangle[]): Edge[] {
		const edges: Edge[] = [];
		let counter = 0;

		for (let i = 0; i < squares.length - 1; i++) {
			const a = squares[i];

			for (let j = i+1; j < squares.length; j++) {
				const b = squares[j];
				counter++;

				const distance = this.geometry.distanceBetweenTwoSquares(a, b);
				if (distance > Aggregator.DISTANCE_THRESHOLD) {
					continue;
				}
				
				const [sizeA, sizeB] = [this.geometry.rectangleSurface(a), this.geometry.rectangleSurface(b)];
				if (Math.abs(sizeA - sizeB) > Math.min(sizeA, sizeB) * Aggregator.SIZE_DIFFERENCE_THRESHOLD) {
					continue;
				}

				edges.push([a, b]);
			}
		}

		console.log(`${counter} Schleifendurchläufe`);
		return edges;
	}

	/**
	 * When looking at two FIP candidates, there are only six locations for the third one to be in.
	 * This function returns the coordinates of these locations.
	 */
	public getPossiblePositions(corner1: Point, corner2: Point): Point[] {
		const v = this.geometry.getVectorBetweenPoints(corner1, corner2);
		const vTurned = this.geometry.rotate2DVector90Degrees(v);

		const p1 = this.geometry.applyVectorToPoint(corner1, vTurned);
		const p4 = this.geometry.applyVectorToPoint(corner1, vTurned, -1);

		const p3 = this.geometry.applyVectorToPoint(corner2, vTurned);
		const p6 = this.geometry.applyVectorToPoint(corner2, vTurned, -1);

		const vAcross = this.geometry.getVectorBetweenPoints(corner1, p3);
		const p2 = this.geometry.applyVectorToPoint(corner1, vAcross, 0.5);
		const vAcrossTurned = this.geometry.rotate2DVector90Degrees(vAcross);
		const p5 = this.geometry.applyVectorToPoint(corner2, vAcross, -0.5);

		return [p1, p2, p3, p4, p5, p6];
	}

	public checkPositioning(edges: Edge[]): QrCode | undefined {
		const map: Map<Rectangle, Rectangle[]> = new Map();
		for (const edge of edges) {
			const currentLeft = map.get(edge[0]) || [];
			const currentRight = map.get(edge[1]) || [];

			map.set(edge[0], [edge[1], ...currentLeft]);
			map.set(edge[1], [edge[0], ...currentRight]);
		}

		let qr: QrCode | undefined;
		map.forEach((val, key) => {
			for (let i = 0; i < val.length - 1; i++) {
				for (let j = i; j < val.length; j++) {
					const positions = this.getPossiblePositions(this.geometry.findMiddleOfRectangle(key), this.geometry.findMiddleOfRectangle(val[i]));
					for (const position of positions) {
						const rectAround = this.geometry.squareAroundPoint(position, Aggregator.LOCATION_TOLERANCE);
						const overlaps = this.geometry.doRectanglesOverlap(rectAround, val[j]);
						if (overlaps) {
							qr = [key, val[i], val[j]];
							return;
						}
					}
				}
			}
		});

		return qr;
	}
}