import {QrCode} from "./Aggregator";

export interface Point {
	x: number;
	y: number;
}

export interface Vector extends Point { };

export interface Rectangle {
	point: Point;
	height: number;
	width: number;
}
export class Geometry {

	public findMiddleOfRectangle(square: Rectangle): Point {
		return {
			x: square.point.x + (square.height / 2),
			y: square.point.y + (square.width / 2),
		}
	}

	public squareAroundPoint(point: Point, size: number): Rectangle {
		return {
			point: {
				x: point.x - (size / 2),
				y: point.y - (size / 2),
			},
			height: size,
			width: size,
		};
	}

	private distanceBetweenTwoPoints(p1: Point, p2: Point): number {
		return Math.sqrt(Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y));
	}

	public distanceBetweenTwoSquares(sq1: Rectangle, sq2: Rectangle): number {
		const p1 = this.findMiddleOfRectangle(sq1);
		const p2 = this.findMiddleOfRectangle(sq2);

		return this.distanceBetweenTwoPoints(p1, p2);
	}

	private convertRectToPoints(rect: Rectangle): [Point, Point] {
		return [rect.point, {
			x: rect.point.x + rect.width,
			y: rect.point.y + rect.height,
		}];
	}

	public doRectanglesOverlap(rect1: Rectangle, rect2: Rectangle): boolean {
		const a = this.convertRectToPoints(rect1);
		const b = this.convertRectToPoints(rect2);

		// https://silentmatt.com/rectangle-intersection/
		return (
			a[0].x < b[1].x && 
			a[1].x > b[0].x &&
			a[0].y < b[1].y &&
			a[1].y > b[0].y
			);
	}

	public rectangleSurface(rectangle: Rectangle): number {
		return rectangle.height * rectangle.width;
	}

	public getCornerPoints(qrCode: QrCode) {
		const corners: Rectangle[] = qrCode;
		let topLeft = qrCode[0];
		let topLeftIndex = 0;
		for (let i = 1; i < 3; i++) {
			if (topLeft.point.x + topLeft.point.y < corners[i].point.x + corners[i].point.x) {
				topLeft = qrCode[i];
				topLeftIndex = i;
			}
		}

		corners.splice(topLeftIndex, 1);
	}

	/**
	 * Returns Vector from P1 to P2
	 */
	public getVectorBetweenPoints(p1: Point, p2: Point): Vector {
		return {
			x: p2.x - p1.x,
			y: p2.y - p1.y,
		};
	}

	public rotate2DVector90Degrees(v: Vector): Vector {
		return {
			x: v.y,
			y: -v.x,
		};
	}

	public applyVectorToPoint(p: Point, v: Vector, factor: number = 1): Point {
		return {
			x: p.x + v.x * factor,
			y: p.y + v.y * factor,
		};
	}
}