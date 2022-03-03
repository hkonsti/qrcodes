# QR Code Scanner
This is a Typescript React implementation of a QR Code Scanner. So far it can detect the finding patterns (FIPs) of QR Codes and draws a red circle around them. To do that, it uses OpenCVs detectMultiScale function and a self-trained cascade, created with the opencv_traincascade tool. The training images used are self-generated.

### Note:
I created this out curiosity for image processing, cascade training and OpenCV. If you come across this looking for a QR Code Scanner implementation, this is by no means the fastest way to do it. Refer to https://github.com/zxing/zxing for a powerful and reliable implementation.