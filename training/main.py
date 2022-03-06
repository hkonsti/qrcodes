import cv2
import numpy as np
import random
import string
import qrcode
import os

def createRandomString(lengthLowerBound, lengthUpperBound):
    length = int((lengthUpperBound-lengthLowerBound)
                 * random.random()+lengthLowerBound)
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


def generateQrCode():
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.ERROR_CORRECT_L,
        box_size=10,
        border=1
    )

    qr.add_data(createRandomString(300, 300))
    qr.make(fit=True)
    return np.asarray(qr.make_image(fill_color="black", back_color="white").convert("RGB"))

# Takes the image of a QR Code and covers the finding pattern corners based on provided parameters.
def coverCorners(qrCodeImg):
    size = qrCodeImg.shape
    percentage = 0.16

    width = size[0]
    x0 = int(width*percentage)
    x1 = int(width - width*percentage)

    upperLeft = [(0, 0), (0, x0), (x0, 0), (x0, x0)]
    upperRight = [(width, 0), (width, x0), (x1, 0), (x1, x0)]
    lowerLeft = [(0, width), (0, x1), (x0, size), (x0, x1)]
    lowerRight = [(width, width), (width, x1), (x1, width), (x1, x1)]

    black = (0, 0, 0)
    thickness = -1
    cv2.rectangle(qrCodeImg, upperLeft[0], upperLeft[3], black, thickness)
    cv2.rectangle(qrCodeImg, upperRight[0], upperRight[3], black, thickness)
    cv2.rectangle(qrCodeImg, lowerLeft[0], lowerLeft[3], black, thickness)
    cv2.rectangle(qrCodeImg, lowerRight[0], lowerRight[3], black, thickness)

    return qrCodeImg

# Converts all other number types to int first.
def randint(x, y):
    return random.randint(int(x), int(y))


def generatePoints(sizeOfImg,
                   maxFillPercentage=0.8,
                   minFillPercentage=0.3,
                   subSquarePercentage=0.3,
                   ):

    highest = int(min(sizeOfImg[:2]) * maxFillPercentage)
    lowest = int(min(sizeOfImg[:2]) * minFillPercentage)

    size = random.randint(lowest, highest)

    bounds = (sizeOfImg[0] - size, sizeOfImg[1] - size)
    point = (random.randint(0, bounds[0]), random.randint(0, bounds[1]))

    squareHeight = int(size / 2)

    SUB_SQUARE_HEIGHT = squareHeight*subSquarePercentage

    x0 = [point[0], point[0]+SUB_SQUARE_HEIGHT]
    y0 = [point[1], point[1]+SUB_SQUARE_HEIGHT]

    x1 = [point[0]+squareHeight*2 - SUB_SQUARE_HEIGHT, point[0]+squareHeight*2]
    y1 = [point[1]+squareHeight*2 - SUB_SQUARE_HEIGHT, point[1]+squareHeight*2]

    square1 = [x0, y0]
    square2 = [x1, y0]
    square3 = [x0, y1]
    square4 = [x1, y1]

    # generate all four points
    points = np.int32([
        [randint(*square1[1]), randint(*square1[0])],
        [randint(*square2[1]), randint(*square2[0])],
        [randint(*square3[1]), randint(*square3[0])],
        [randint(*square4[1]), randint(*square4[0])],
    ])

    return (points, (point, size))

def getRandomBackground():
    BACKGROUND_COUNT = 20579
    number = int(random.random() * BACKGROUND_COUNT)

    return cv2.imread("../background/" + str(number) + ".jpg")

def getVector(p1, p2):
    return (float(p1[0] - p2[0]), float(p1[1] - p2[1]))

def projectImageToBackground(image, background):
    w = image.shape[0]
    pts = np.float32([[0, 0], [w, 0], [0, w], [w, w]])
    pts1, info = generatePoints(background.shape[:2], 0.15, 0.08)

    matrix, _ = cv2.findHomography(pts, pts1, cv2.RANSAC, 5.0)
    result = cv2.warpPerspective(
        np.array(image), matrix, (background.shape[1], background.shape[0]), borderValue=(255, 255, 255))

    zeros = np.zeros(background.shape[:3], dtype=np.uint8)
    ignore_color = (255,)*background.shape[2]

    converted = np.int32([
        pts1[1],
        pts1[0],
        pts1[2],
        pts1[3],
    ])

    cv2.fillConvexPoly(zeros, converted, ignore_color)

    inverted = cv2.bitwise_not(zeros)
    masked = cv2.bitwise_and(inverted, background)
    masked_projected = cv2.bitwise_and(zeros, result)
    final = cv2.bitwise_or(masked_projected, masked)

    return (final, info)

def blurImage(image):
    BLUR_PERCENTAGE = randint(10, 15) / 1000
    x = int(BLUR_PERCENTAGE*min(image.shape[:2]))
    size = (x, x)
    return cv2.blur(image, size)

def addNoise(image, noiseImage):
    noiseImage = cv2.resize(noiseImage, image.shape[:2][::-1], interpolation=cv2.INTER_LINEAR)
    return cv2.addWeighted(image, 0.7, noiseImage, 0.3, 0)

def addExposure(img, gamma):
    gamma_table=[np.power(x/255.0,gamma)*255.0 for x in range(256)]
    gamma_table=np.round(np.array(gamma_table)).astype(np.uint8)
    return cv2.LUT(img,gamma_table)

# info: ((x, y), height)
def generateStringFromInfo(path, info):
    TAB = " "
    NUMBER_OF_ELEMENTS = 1
    return path + TAB + str(NUMBER_OF_ELEMENTS) + TAB + str(info[0][1]) + TAB + str(info[0][0]) + TAB + str(info[1]) + TAB + str(info[1]) + "\n"

corner = cv2.imread("./fip.png")
corners_rotated = (corner, cv2.rotate(corner, cv2.ROTATE_90_CLOCKWISE), cv2.rotate(corner, cv2.ROTATE_180), cv2.rotate(corner, cv2.ROTATE_90_COUNTERCLOCKWISE))

def loadCorners():
    list = os.listdir("./patterns")
    corners = []

    for entry in list:
        if entry != ".DS_Store":
            corners.append(cv2.imread("./patterns/"+entry))

    corners_rotated = []
    for corner in corners:
        corners_rotated.append(corner)
        corners_rotated.append(cv2.rotate(corner, cv2.ROTATE_90_CLOCKWISE))
        corners_rotated.append(cv2.rotate(corner, cv2.ROTATE_180))
        corners_rotated.append(cv2.rotate(corner, cv2.ROTATE_90_COUNTERCLOCKWISE))

    return corners_rotated

corners = loadCorners()

def getRandomCorner(corners):
    return corners[randint(0, len(corners)-1)]

def generatePositiveSample():
    backgroundDog = getRandomBackground()
    image, position = projectImageToBackground(getRandomCorner(corners), backgroundDog)
    image = blurImage(image)

    noiseDog = getRandomBackground()
    image = addNoise(image, noiseDog)
    image = addExposure(image, 0.5)
    return image, position

def generateSamples():
    f = open("positive.txt", "a")

    for i in range(20000):
        print("Generating Image No. "+str(i))
        image, position = generatePositiveSample()

        path = "./positive/"+str(i)+".png"
        f.write(generateStringFromInfo(path, position))
        cv2.imwrite(path, image)

    f.close()
    f = open("negative.txt", "a")

    for i in range(20000):
        print("Generating Image No. "+str(i))
        dog = getRandomBackground()
        qr = generateQrCode()
        res = coverCorners(qr)
        final = projectImageToBackground(res, dog)

        path = "./negative/"+str(i)+".png"
        f.write(path + "\n")
        cv2.imwrite(path, final[0])

    f.close()


generateSamples()
