
enum CameraStatus {
	STREAM_RUNNING,
	NO_ACCESS,
	NO_CAMERA,
}

export class Camera {

	stream: MediaStream | undefined;
	devices: MediaDeviceInfo[] = [];
	currentCamerId: string | undefined;

	/**
	 * Asks for permission for camera stream and sets up stream.
	 * @returns If permission was given by the user
	 */
	public async setUpStream(videoElement: HTMLVideoElement): Promise<CameraStatus> {
		const hasPermission = await this.getPermissions();
		if (!hasPermission) {
			return CameraStatus.NO_ACCESS;
		}

		const deviceHasCamera = await this.getVideoDevices();
		if (!deviceHasCamera) {
			return CameraStatus.NO_CAMERA;
		}

		this.currentCamerId = this.devices[0].deviceId;
		videoElement.srcObject = this.stream!;
		videoElement.play();

		return CameraStatus.STREAM_RUNNING;
	}

	/**
	 * Asks camera permission from user and returns true if permission has been given, false otherwise.
	 */
	private async getPermissions(): Promise<boolean> {
		try {
			// https://github.com/bensonruan/webcam-easy/blob/0ebfea62fec456c9b618d5f17c72386124e753b5/dist/webcam-easy.js#L49
			this.stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Returns true, if the device has any video devices, false otherwise.
	 */
	private async getVideoDevices(): Promise<boolean> {
		const devices = await navigator.mediaDevices.enumerateDevices();

		const videoDevies = [];
		devices.forEach(device => {
			if (device.kind === "videoinput") {
				videoDevies.push(device);
			}
		});

		this.devices = devices;
		return this.devices.length > 0;
	}

	public async drawImageOnCanvas(canvasElement: HTMLCanvasElement, videoElement: HTMLVideoElement) {
		canvasElement.height = videoElement.height;
		canvasElement.width = videoElement.width;
		const context = canvasElement.getContext("2d");
		context!.clearRect(0, 0, canvasElement.width, canvasElement.height);
		context!.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
	}
}