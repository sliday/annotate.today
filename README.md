# annotate.today - Ultra Simple Image Annotation Tool

A lightweight, serverless tool for adding annotations to images. Just add your image URL and start annotating! Download and share your annotated images with others.

![default-image](https://github.com/user-attachments/assets/00b3c2ca-c3a7-449b-b2d1-5e088457d204)

## Usage

1. Go to: `annotate.today/?url=YOUR_IMAGE_URL`
2. Double-click anywhere on the image to add annotations
3. Click Download to save your annotated image

Example:

https://annotate.today/?url=YOUR_IMAGE_URL

## CORS Requirements

This tool needs to load images from external sources. To save annotated images:

1. The image source must allow CORS access (have proper Access-Control-Allow-Origin headers)
2. Use images from the same domain as the tool
3. Or use a CORS proxy service

Example of CORS-friendly image hosts:
- imgur.com
- cloudinary.com
- Your own server with proper CORS headers
