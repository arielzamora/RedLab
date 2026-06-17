import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER || 'uploads';

    if (process.env.STORAGE_PROVIDER === 'azure' && connectionString) {
      try {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        console.log('Azure Blob Storage initialized successfully.');
      } catch (err) {
        console.error('Failed to initialize Azure Blob Storage SDK:', err);
      }
    }
  }

  async uploadFile(file: any, request: any): Promise<string> {
    if (!file || !file.buffer) return '';

    if (this.blobServiceClient) {
      try {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        await containerClient.createIfNotExists({ access: 'blob' });
        
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path.extname(file.originalname || '');
        const fileName = `${uniqueSuffix}${extension}`;
        
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.upload(file.buffer, file.buffer.length, {
          blobHTTPHeaders: { blobContentType: file.mimetype }
        });
        
        return blockBlobClient.url;
      } catch (err) {
        console.error('Azure Blob Storage upload failed, falling back to local storage:', err);
      }
    }

    // Local Storage Fallback
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname || '');
      const filename = `${uniqueSuffix}${extension}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, file.buffer);

      const baseUrl = `${request.protocol}://${request.get('host')}`;
      return `${baseUrl}/uploads/${filename}`;
    } catch (err) {
      console.error('Local file write failed:', err);
      throw new InternalServerErrorException('No se pudo guardar la imagen localmente.');
    }
  }

  async getDiagnostics() {
    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
    let testError: any = null;
    let containerProperties: any = null;

    if (this.blobServiceClient) {
      try {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        
        // Test 1: getProperties
        const props = await containerClient.getProperties();
        containerProperties = {
          blobPublicAccess: props.blobPublicAccess,
          lastModified: props.lastModified,
        };

        // Test 2: createIfNotExists
        try {
          await containerClient.createIfNotExists({ access: 'blob' });
        } catch (createErr: any) {
          testError = {
            step: 'createIfNotExists with access: blob',
            message: createErr.message,
            code: createErr.code,
            statusCode: createErr.statusCode,
          };
        }

        // Test 3: upload
        if (!testError) {
          try {
            const blockBlobClient = containerClient.getBlockBlobClient('test-diagnostics-file.txt');
            const testContent = 'test';
            await blockBlobClient.upload(Buffer.from(testContent), testContent.length, {
              blobHTTPHeaders: { blobContentType: 'text/plain' }
            });
          } catch (uploadErr: any) {
            testError = {
              step: 'blockBlobClient.upload',
              message: uploadErr.message,
              code: uploadErr.code,
              statusCode: uploadErr.statusCode,
            };
          }
        }
      } catch (err: any) {
        testError = {
          step: 'getProperties (initial connection)',
          message: err.message,
          code: err.code,
          statusCode: err.statusCode,
        };
      }
    }

    return {
      provider: process.env.STORAGE_PROVIDER,
      containerName: this.containerName,
      hasConnectionString: !!connStr,
      connectionStringLength: connStr ? connStr.length : 0,
      initialized: !!this.blobServiceClient,
      testError,
      containerProperties,
    };
  }
}
