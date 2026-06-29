import { storage, isFirebaseConfigured } from './firebase';
import { dbMetrics } from './firestore';
import { 
  ref, 
  uploadBytes as firebaseUploadBytes, 
  uploadBytesResumable as firebaseUploadBytesResumable,
  getDownloadURL, 
  deleteObject, 
  listAll,
  StorageError
} from 'firebase/storage';

export enum StorageOperationType {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  DELETE = 'delete',
  LIST = 'list',
}

export interface StorageErrorInfo {
  error: string;
  operationType: StorageOperationType;
  path: string;
}

/**
 * Standardized storage error handler
 */
export function handleStorageError(error: unknown, operationType: StorageOperationType, path: string): never {
  const errInfo: StorageErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firebase Storage Action Failed:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

export async function uploadBytes(reference: any, data: any, metadata?: any) {
  dbMetrics.storageUploads += 1;
  return firebaseUploadBytes(reference, data, metadata);
}

export function uploadBytesResumable(reference: any, data: any, metadata?: any) {
  dbMetrics.storageUploads += 1;
  return firebaseUploadBytesResumable(reference, data, metadata);
}

export { 
  storage, 
  isFirebaseConfigured, 
  ref, 
  getDownloadURL, 
  deleteObject, 
  listAll 
};
