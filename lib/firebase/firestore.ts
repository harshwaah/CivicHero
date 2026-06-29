import { db, isFirebaseConfigured, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDoc as firebaseGetDoc, 
  getDocs as firebaseGetDocs, 
  setDoc as firebaseSetDoc, 
  addDoc as firebaseAddDoc, 
  updateDoc as firebaseUpdateDoc, 
  deleteDoc as firebaseDeleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  onSnapshot as firebaseOnSnapshot,
  FirestoreError
} from 'firebase/firestore';

export interface DBMetrics {
  reads: number;
  writes: number;
  activeListeners: number;
  storageUploads: number;
}

// Persist metrics across client lifecycles if needed
const globalForDBMetrics = global as unknown as { dbMetrics?: DBMetrics };
export const dbMetrics: DBMetrics = globalForDBMetrics.dbMetrics || {
  reads: 0,
  writes: 0,
  activeListeners: 0,
  storageUploads: 0
};
if (!globalForDBMetrics.dbMetrics) {
  globalForDBMetrics.dbMetrics = dbMetrics;
}

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

export async function getDoc(reference: any) {
  dbMetrics.reads += 1;
  return firebaseGetDoc(reference);
}

export async function getDocs(reference: any) {
  const snap = await firebaseGetDocs(reference);
  dbMetrics.reads += (snap?.docs?.length || 0) + 1; // 1 for query metadata, and count for each doc returned
  return snap;
}

export async function setDoc(reference: any, data: any, options?: any) {
  dbMetrics.writes += 1;
  const sanitized = sanitizeData(data);
  return firebaseSetDoc(reference, sanitized, options);
}

export async function addDoc(reference: any, data: any) {
  dbMetrics.writes += 1;
  const sanitized = sanitizeData(data);
  return firebaseAddDoc(reference, sanitized);
}

export async function updateDoc(reference: any, data: any) {
  dbMetrics.writes += 1;
  const sanitized = sanitizeData(data);
  return firebaseUpdateDoc(reference, sanitized);
}

export async function deleteDoc(reference: any) {
  dbMetrics.writes += 1;
  return firebaseDeleteDoc(reference);
}

export function onSnapshot(reference: any, onNext: any, onError?: any, onCompletion?: any) {
  dbMetrics.activeListeners += 1;
  
  const wrappedOnNext = (snapshot: any) => {
    if (snapshot?.docs) {
      dbMetrics.reads += snapshot.docs.length || 1;
    } else {
      dbMetrics.reads += 1;
    }
    if (onNext) onNext(snapshot);
  };

  const unsub = firebaseOnSnapshot(reference, wrappedOnNext, onError, onCompletion);
  
  return () => {
    dbMetrics.activeListeners = Math.max(0, dbMetrics.activeListeners - 1);
    unsub();
  };
}

export { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit
};
