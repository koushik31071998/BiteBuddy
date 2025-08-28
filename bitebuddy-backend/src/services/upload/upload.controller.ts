import { Request, Response } from 'express';
import Busboy from 'busboy';
import UploadClass from './upload.class';
import path from 'path';

export const uploadFile = (req: Request, res: Response) => {

  // Check if req is properly defined
  if (!req) {
    return res.status(400).json({ message: 'Invalid request object' });
  }

  // Check if headers exist
  if (!req.headers) {
    return res.status(400).json({ message: 'Request headers not found' });
  }

  // Check content-type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return res.status(400).json({ 
      message: 'Invalid content type. Expected multipart/form-data',
      received: contentType 
    });
  }

  try {
    const busboy = Busboy({ headers: req.headers });
    let fileUploaded = false;
    let responsesSent = false;
    let pendingUploads = 0; 

    busboy.on('file', async (fieldname: string, file: NodeJS.ReadableStream, info: any) => {
      pendingUploads++;
      
      const filename = info.filename || 'unknown';
      const uniqueName = `${Date.now()}-${filename}`;
      const mimetype = info.mimetype;

      try {
        // Upload to S3 bucket 
        const result = await UploadClass.uploadToS3(file, uniqueName, mimetype);

        // Handle the file save
        await UploadClass.saveFile(file, uniqueName);

        fileUploaded = true;
        pendingUploads--;

        // Send response immediately after successful save
        if (!responsesSent) {
          responsesSent = true;
          res.status(200).json({ message: 'File uploaded successfully', filename: uniqueName });
        }
      } catch (error: any) {
        console.error('File save error:', error);
        pendingUploads--;

        if (!responsesSent) {
          responsesSent = true;
          res.status(500).json({ message: error.message });
        }
      }
    });

    busboy.on('error', (err: any) => {
      console.error('Busboy error:', err);
      if (!responsesSent) {
        responsesSent = true;
        res.status(500).json({ message: err.message });
      }
    });

    busboy.on('finish', () => {
 
      // Only send "No file uploaded" if no files were processed and no uploads are pending
      if (!fileUploaded && pendingUploads === 0 && !responsesSent) {
        responsesSent = true;
        res.status(400).json({ message: 'No file uploaded' });
      }
    }); 

    req.pipe(busboy);
    
  } catch (error: any) {
    console.error('Upload controller error:', error);
    res.status(500).json({ message: `Upload error: ${error.message}` });
  }
};
