import path from 'path';
import fs from 'fs';
import { s3 } from '../../config/aws';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';


export default class UploadService {

    static saveFile(fileStream: NodeJS.ReadableStream, fileName: string) {
        const uploadPath = path.join(__dirname, '../../../src/uploads', fileName);

        return new Promise((resolve, reject) => {

            const writeStream = fs.createWriteStream(uploadPath)

            fileStream.pipe(writeStream);
            writeStream.on('finish', () => resolve({ filePath: uploadPath }));
            writeStream.on('error', (err) => reject(err));
        })

    }

    static async uploadToS3(fileStream: NodeJS.ReadableStream, filename: string, mimetype: string) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: filename,
            Body: fileStream as Readable,
            ContentType: mimetype,
        };

        try {
            const upload = new Upload({
                client: s3,
                params: params,
            });

            const result = await upload.done();

            return {
                url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`,
                location: result.Location,
                key: result.Key,
                bucket: result.Bucket
            };
        } catch (error) {
            console.error('S3 upload error:', error);
            throw new Error(`Failed to upload file to S3: ${error}`);
        }
    }
}       
