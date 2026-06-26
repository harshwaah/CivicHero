import { storage, isFirebaseConfigured } from './firebase';
import { 
  ref, 
  uploadBytes, 
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

export { 
  storage, 
  isFirebaseConfigured, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll 
};
