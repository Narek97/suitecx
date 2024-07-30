import { CompleteMultiPartDocument } from '@/gql/mutations/generated/completeMultiPart.generated';
import { CreateMultipartDocument } from '@/gql/mutations/generated/createMultipart.generated';
import { GetPreSignedUrlDocument } from '@/gql/mutations/generated/getPresignedUrl.generated';
import { fetchData } from '@/utils/helpers/custom-gql-fetcher';


export class UploadFile {
  chunkSize: number;
  threadsQuantity: number;
  file: File;
  fileType: string;
  type: string;
  category?: string;
  fileName?: string;
  relatedId: string;
  aborted: boolean;
  uploadedSize: number;
  progressCache: any;
  activeConnections: any;
  parts: any[];
  uploadedParts: any[];
  fileId: null;
  fileKey: null;
  detailedInput: null;
  embedMapInput: {
    rowId: number;
    columnId: number;
  };
  onProgressFn: (percent: any) => void;
  onFinisFn: (files: File) => void;
  onErrorFn: (err: unknown) => void;

  constructor(options: any) {
    // this must be bigger than or equal to 5MB,
    // otherwise AWS will respond with:
    // "Your proposed upload is smaller than the minimum allowed size"
    this.chunkSize = options.chunkSize || 1024 * 1024 * 100;
    // number of parallel uploads
    this.threadsQuantity = Math.min(options.threadsQuantity || 5, 15);
    this.file = options.file;
    this.fileType = options.fileType;
    this.type = options.type;
    this.category = options.category;
    this.fileName = options.fileName;
    this.relatedId = options.relatedId;
    this.detailedInput = options.detailedInput;
    this.embedMapInput = options.embedMapInput;
    this.aborted = false;
    this.uploadedSize = 0;
    this.progressCache = {};
    this.activeConnections = {};
    this.parts = [];
    this.uploadedParts = [];
    this.fileId = null;
    this.fileKey = null;
    this.onProgressFn = () => {};
    this.onFinisFn = () => {};
    this.onErrorFn = () => {};
  }

  // starting the multipart upload request
  start() {
    this.initialize().then(() => {});
  }

  async initialize() {
    try {
      const initializeResponse = await fetchData({
        bodyData: CreateMultipartDocument,
        variables: {
          createMultipartInput: {
            id: this.relatedId,
            contentType: this.file.type,
            attachmentType: this.type,
            fileType: this.fileType,
          },
        },
        endpoint: 'graphql',
        method: 'POST',
      });
      const AWSFileDataOutput = initializeResponse.data.createMultipart.createMultipartData;
      this.fileId = AWSFileDataOutput.UploadId;
      this.fileKey = AWSFileDataOutput.Key;

      // retrieving the pre-signed URLs
      const numberOfParts = Math.ceil(this.file.size / this.chunkSize);
      const newParts: any[] = [];
      if (numberOfParts) {
        for (let i = 1; i <= numberOfParts; i++) {
          const urlsResponse = await fetchData({
            bodyData: GetPreSignedUrlDocument,
            variables: {
              getPreSignedUrlInput: {
                uploadId: this.fileId,
                name: this.fileKey,
                parts: i,
              },
            },
            endpoint: 'graphql',
            method: 'POST',
          });

          newParts.push({
            signedUrl: urlsResponse.data.getPreSignedUrl.key,
            PartNumber: i,
          });
        }
      } else {
        this.onProgressFn({
          sent: 0,
          total: 0,
          percentage: 100,
        });
      }

      this.parts.push(...newParts);
      this.sendNext();
    } catch (error: unknown) {
      await this.complete(error);
    }
  }

  sendNext() {
    const activeConnections = Object.keys(this.activeConnections).length;
    if (activeConnections >= this.threadsQuantity) {
      return;
    }

    if (!this.parts.length) {
      if (!activeConnections) {
        this.complete().then(() => {});
      }

      return;
    }

    const part: any = this.parts.pop();

    if (this.file && part) {
      const sentSize = (part.PartNumber - 1) * this.chunkSize;
      const chunk = this.file.slice(sentSize, sentSize + this.chunkSize);

      const sendChunkStarted = () => {
        this.sendNext();
      };

      this.sendChunk(chunk, part, sendChunkStarted)
        .then(() => {
          this.sendNext();
        })
        .catch(error => {
          this.parts.push(part);
          this.complete(error).then(() => {});
        });
    }
  }

  // terminating the multipart upload request on success or failure
  async complete(error?: unknown) {
    if (error && !this.aborted) {
      this.onErrorFn(error);
      return;
    }

    if (error) {
      this.onErrorFn(error);
      return;
    }

    try {
      await this.sendCompleteRequest();
    } catch (err: unknown) {
      this.onErrorFn(err);
    }
  }

  // finalizing the multipart upload request on success by calling
  // the finalization API
  async sendCompleteRequest() {
    const sortedParts = this.uploadedParts.sort((a, b) =>
      a.PartNumber > b.PartNumber ? 1 : a.PartNumber < b.PartNumber ? -1 : 0,
    );
    if (this.fileId && this.fileKey) {
      const completeMultiPartInput = {
        UploadId: this.fileId,
        Key: this.fileKey,
        type: this.type,
        category: this.category,
        name: this.fileName || this.file.name,
        relatedId: this.relatedId,
        parts: sortedParts,
        detailedInput: this.detailedInput,
        embedMapInput: this.embedMapInput,
      };
      const files = await fetchData({
        bodyData: CompleteMultiPartDocument,
        variables: {
          completeMultiPartInput,
        },
        endpoint: 'graphql',
        method: 'POST',
      });
      this.onFinisFn(files.data.completeMultiPart);
    }
  }

  sendChunk(chunk: any, part: any, sendChunkStarted: any) {
    return new Promise((resolve, reject) => {
      this.upload(chunk, part, sendChunkStarted)
        .then(status => {
          if (status !== 200) {
            reject(new Error('Failed chunk upload'));
            return;
          }

          resolve(1);
        })
        .catch(error => {
          console.log(error, 'error');
          reject(error);
        });
    });
  }

  // calculating the current progress of the multipart upload request
  handleProgress(part: any, event: any) {
    if (this.file) {
      if (event.type === 'progress' || event.type === 'error' || event.type === 'abort') {
        this.progressCache[part] = event.loaded;
      }

      if (event.type === 'uploaded') {
        this.uploadedSize += this.progressCache[part] || 0;
        delete this.progressCache[part];
      }

      const inProgress = Object.keys(this.progressCache)
        .map(Number)
        .reduce((p, id) => this.progressCache[id], 0);

      const sent = Math.min(this.uploadedSize + inProgress, this.file.size);

      const total = this.file.size;

      const percentage = Math.round((sent / total) * 100);

      this.onProgressFn({
        sent,
        total,
        percentage,
      });
    }
  }

  // uploading a part through its pre-signed URL
  upload(file: any, part: any, sendChunkStarted: any) {
    // uploading each part with its pre-signed URL
    return new Promise((resolve, reject) => {
      if (this.fileId && this.fileKey) {
        // - 1 because PartNumber is an mapIcons starting from 1 and not 0
        const xhr = (this.activeConnections[part.PartNumber - 1] = new XMLHttpRequest());

        sendChunkStarted();

        const progressListener = this.handleProgress.bind(this, part.PartNumber - 1);
        xhr.upload.addEventListener('progress', progressListener);
        xhr.addEventListener('error', progressListener);
        xhr.addEventListener('abort', progressListener);
        xhr.addEventListener('loadend', progressListener);
        xhr.open('PUT', part.signedUrl);

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            // retrieving the ETag parameter from the HTTP headers
            const ETag = xhr.getResponseHeader('ETag');
            if (ETag) {
              const uploadedPart = {
                PartNumber: part.PartNumber,
                ETag: ETag.replaceAll('"', ''),
              };

              this.uploadedParts.push(uploadedPart);
              resolve(xhr.status);
              delete this.activeConnections[part.PartNumber - 1];
            }
          }
        };

        xhr.onerror = error => {
          reject(error);
          delete this.activeConnections[part.PartNumber - 1];
        };

        xhr.onabort = () => {
          reject(new Error('Upload canceled by user'));
          delete this.activeConnections[part.PartNumber - 1];
        };
        xhr.send(file);
      }
    });
  }

  onProgress(onProgress: any) {
    this.onProgressFn = onProgress;
    return this;
  }

  onFinish(files: any) {
    this.onFinisFn = files;
    return this;
  }

  onError(onError: any) {
    this.onErrorFn = onError;
    return this;
  }

  abort() {
    Object.keys(this.activeConnections)
      .map(Number)
      .forEach(id => {
        this.activeConnections[id].abort();
      });

    this.aborted = true;
  }
}
