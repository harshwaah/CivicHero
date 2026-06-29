import { db, isFirebaseConfigured, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc as firebaseSetDoc, 
  addDoc as firebaseAddDoc, 
  updateDoc as firebaseUpdateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  onSnapshot,
  FirestoreError
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

/**
 * Standardized Firebase integration error handler
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Action Failed:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively cleans undefined values from an object, as Firestore does not allow undefined fields.
 */
export function sanitizeData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeData(item)) as unknown as T;
  }

  // Handle custom/special objects (like class instances)
  if (typeof obj === 'object') {
    const proto = Object.getPrototypeOf(obj);
    if (proto !== null && proto !== Object.prototype) {
      return obj;
    }

    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        result[key] = sanitizeData(val);
      }
    }
    return result as T;
  }

  return obj;
}

export async function setDoc(reference: any, data: any, options?: any) {
  const sanitized = sanitizeData(data);
  return firebaseSetDoc(reference, sanitized, options);
}

export async function addDoc(reference: any, data: any) {
  const sanitized = sanitizeData(data);
  return firebaseAddDoc(reference, sanitized);
}

export async function updateDoc(reference: any, data: any) {
  const sanitized = sanitizeData(data);
  return firebaseUpdateDoc(reference, sanitized);
}

export { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
};
