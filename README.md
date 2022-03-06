# QR Code Scanner

![Animation of QrCode Detection](./demo.gif)

This is a Typescript React implementation of a QR Code Scanner. So far it can detect the finding patterns (FIPs) of QR Codes and use distance, size, and position criterions to group them.

For the object detection, it uses OpenCVs detectMultiScale function and a self-trained cascade, created with the opencv_traincascade tool. The training images used are self-generated. 

More information about the training process can be found in `./training`.

### Note:
I created this out of curiosity for image processing, cascade training, and OpenCV over the span of two weekends. If you come across this looking for a QR Code Scanner implementation, this is by no means a good way to do it. Refer to https://github.com/zxing/zxing for a powerful and reliable implementation.

## Sources:
https://www.researchgate.net/profile/Nina-Hirata/publication/221337868_Fast_QR_Code_Detection_in_Arbitrarily_Acquired_Images/links/0c96051fbe56ac8a6e000000/Fast-QR-Code-Detection-in-Arbitrarily-Acquired-Images.pdf