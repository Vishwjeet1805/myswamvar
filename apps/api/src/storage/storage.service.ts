import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';

export interface StorageUploadResult {
  url: string;
  key: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
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

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists();
  }

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<StorageUploadResult> {
    if (!this.client) {
      throw new Error('Storage is not configured');
    }
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    } catch (error) {
      // MinIO/S3 may start without the bucket pre-created in fresh environments.
      if (this.isNoSuchBucketError(error)) {
        this.logger.warn(
          `Bucket "${this.bucket}" missing during upload. Creating and retrying once.`,
        );
        await this.ensureBucketExists();
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
          }),
        );
      } else {
        throw error;
      }
    }
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
    if (!this.bucket || !url) {
      return null;
    }

    const directPrefix = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, '')}/${this.bucket}/`
      : `https://${this.bucket}.s3.amazonaws.com/`;
    if (url.startsWith(directPrefix)) {
      return url.slice(directPrefix.length);
    }

    try {
      const parsed = new URL(url);
      const bucketPathPrefix = `/${this.bucket}/`;
      if (parsed.pathname.startsWith(bucketPathPrefix)) {
        return decodeURIComponent(parsed.pathname.slice(bucketPathPrefix.length));
      }
    } catch {
      return null;
    }
    return null;
  }

  toPublicUrl(url: string): string {
    const key = this.keyFromUrl(url);
    if (!key) {
      return url;
    }
    return this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, '')}/${this.bucket}/${key}`
      : `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  private async ensureBucketExists(): Promise<void> {
    if (!this.client || !this.bucket) {
      return;
    }
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      await this.ensurePublicReadPolicy();
      return;
    } catch (error) {
      if (!this.isNoSuchBucketError(error)) {
        this.logger.warn(
          `Unable to verify bucket "${this.bucket}" right now; will continue.`,
        );
        return;
      }
    }

    await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    this.logger.log(`Created S3 bucket "${this.bucket}"`);
    await this.ensurePublicReadPolicy();
  }

  private isNoSuchBucketError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }
    const code = (error as { name?: string; Code?: string }).name
      ?? (error as { name?: string; Code?: string }).Code;
    return code === 'NoSuchBucket' || code === 'NotFound';
  }

  private async ensurePublicReadPolicy(): Promise<void> {
    if (!this.client || !this.bucket) {
      return;
    }
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };
    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(policy),
      }),
    );
  }
}
