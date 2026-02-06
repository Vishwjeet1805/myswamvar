import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

export interface StorageUploadResult {
  url: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string;
  private readonly publicBaseUrl: string | undefined;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? '';
    const endpoint = process.env.S3_ENDPOINT;
    this.publicBaseUrl = process.env.S3_PUBLIC_BASE_URL ?? endpoint;

    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    if (this.bucket && accessKey && secretKey) {
      this.client = new S3Client({
        region: process.env.S3_REGION ?? 'us-east-1',
        endpoint: endpoint,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle: !!endpoint,
      });
      this.logger.log('S3 storage configured');
    } else {
      this.logger.warn(
        'S3 not configured. Photo upload will fail.',
      );
    }
  }

  isConfigured(): boolean {
    return this.client != null && this.bucket.length > 0;
  }

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<StorageUploadResult> {
    if (!this.client) {
      throw new Error('Storage is not configured');
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    const url = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, '')}/${this.bucket}/${key}`
      : `https://${this.bucket}.s3.amazonaws.com/${key}`;
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('Storage is not configured');
    }
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  keyFromUrl(url: string): string | null {
    const prefix = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, '')}/${this.bucket}/`
      : `https://${this.bucket}.s3.amazonaws.com/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : null;
  }
}
