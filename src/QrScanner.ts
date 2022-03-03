import { OpenCV } from "./opencv/OpenCV";

interface Coordinate {
    x: number;
    y: number;
}

interface Rectangle {
    upperLeft: Coordinate;
    lowerRight: Coordinate;
}

export class QrScanner {

    isCVInitialized: boolean = false;
    
    isFileInitialized: boolean = false;
    path: string = "CASCADE_FILE";

    classifier: any;

    private async waitForFile(path: string, url: string): Promise<void> {
        return new Promise((res, rej) => {
            let utils = new Utils("errorMessage");
            utils.createFileFromUrl(path, url, () => {
                res();
            });
        });
    }

    public async scan(image: HTMLCanvasElement): Promise<void> {
        await this.findFIPs(image)
    }

    private async findFIPs(image: HTMLCanvasElement): Promise<any> {
        if (!this.isCVInitialized) {
            await OpenCV.loadOpenCV();
            this.isCVInitialized = true;
        }

        if (!this.isFileInitialized) {
            let file = "./cv/cascade_selftrained_8.xml";
            await this.waitForFile(this.path, file);
            this.isFileInitialized = true;
        }

        if (!this.classifier) {
            this.classifier = new cv.CascadeClassifier();
            this.classifier.load(this.path);
        }

        let img = cv.imread(image);

        // Convert to grayscale
        let gray = new cv.Mat();
        cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

        let fips = new cv.RectVector();
        let msize = new cv.Size(0,0);
        this.classifier.detectMultiScale(gray, fips, 1.1, 3, 0, msize, msize);

        console.log(fips.size());

        for (let i = 0; i < fips.size(); ++i) {
            let p = fips.get(i);

            let p1 = new cv.Point(p.x, p.y);
            let p2 = new cv.Point(p.x + p.width, p.y + p.height);

            cv.rectangle(img, p1, p2, [255, 0, 0, 255]);
        }

        cv.imshow(image, img)

        img.delete();
        gray.delete();
        fips.delete();
    }

}