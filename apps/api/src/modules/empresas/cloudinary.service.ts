import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Lê a configuração automaticamente da env var CLOUDINARY_URL
 * (cloudinary://api_key:api_secret@cloud_name) - nenhuma chamada a
 * cloudinary.config() é necessária.
 */
@Injectable()
export class CloudinaryService {
  uploadLogo(empresaId: string, file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'sistema-mei/logos',
          public_id: `${empresaId}-${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Falha no upload da logo.'));
            return;
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
