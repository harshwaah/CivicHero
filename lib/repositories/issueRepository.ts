import { 
  db, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from '../firebase/firestore';
import { Issue, Comment } from '../models';
import { mockReports } from '../mockReports';

type Subscriber = (issues: Issue[]) => void;
type IssueSubscriber = (issue: Issue | null) => void;

let subscribers: Subscriber[] = [];
const issueSubscribers: Map<string, IssueSubscriber[]> = new Map();

let globalUnsubscribe: (() => void) | null = null;
let currentIssues: Issue[] = [];
let isSeeding = false;

async function optionalDelay() {
  if (typeof window !== 'undefined') {
    const delayVal = localStorage.getItem('dev_artificial_delay');
    if (delayVal) {
      const ms = parseInt(delayVal, 10);
      if (!isNaN(ms) && ms > 0) {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }
  }
}

async function ensureSeedData() {
  if (!isFirebaseConfigured || isSeeding) return;
  
  try {
    const snapshot = await getDocs(collection(db, 'issues'));
    if (snapshot.empty) {
      isSeeding = true;
      console.log('Seeding initial reports to Firestore...');
      for (const report of mockReports) {
        await setDoc(doc(db, 'issues', report.id), report);
      }
      console.log('Seeding complete.');
      isSeeding = false;
    }
  } catch (err) {
    console.error('Error seeding data:', err);
    isSeeding = false;
  }
}

function startGlobalListener() {
  if (!isFirebaseConfigured || globalUnsubscribe) return;
  
  globalUnsubscribe = onSnapshot(collection(db, 'issues'), (snapshot: any) => {
    const issues = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as Issue));
    currentIssues = issues;
    subscribers.forEach(sub => sub([...issues]));
  }, (err: any) => {
    console.error('Error listening to issues:', err);
  });
}

function stopGlobalListener() {
  if (globalUnsubscribe) {
    globalUnsubscribe();
    globalUnsubscribe = null;
  }
}

const issueUnsubscribes: Map<string, () => void> = new Map();

export async function invalidateCopilotBriefing() {
  if (isFirebaseConfigured) {
    try {
      const briefingRef = doc(db, 'copilot_briefings', 'latest');
      await setDoc(briefingRef, { invalidated: true }, { merge: true });
      console.log('[COPILOT] Event-driven invalidation triggered: Cache marked as invalidated in Firestore.');
    } catch (err) {
      console.warn('[COPILOT] Failed to invalidate copilot briefing in Firestore:', err);
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.setItem('copilot_briefing_invalidated', 'true');
      console.log('[COPILOT] Event-driven invalidation triggered: Cache marked as invalidated in localStorage.');
    }
  }
}

function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      if (obj[key] !== undefined) {
        acc[key] = cleanUndefined(obj[key]);
      }
      return acc;
    }, {});
  }
  return obj;
}

export const IssueRepository = {
  subscribe(callback: Subscriber): () => void {
    subscribers.push(callback);
    
    // Support artificial development delay for skeleton load testing
    if (typeof window !== 'undefined' && localStorage.getItem('dev_artificial_delay')) {
      const ms = parseInt(localStorage.getItem('dev_artificial_delay') || '0', 10);
      if (ms > 0) {
        setTimeout(() => callback([...currentIssues]), ms);
      } else {
        callback([...currentIssues]);
      }
    } else {
      callback([...currentIssues]);
    }

    if (subscribers.length === 1 && isFirebaseConfigured) {
      ensureSeedData().then(() => {
        startGlobalListener();
      });
    }

    return () => {
      subscribers = subscribers.filter(sub => sub !== callback);
      if (subscribers.length === 0) {
        stopGlobalListener();
      }
    };
  },

  subscribeToIssue(id: string, callback: IssueSubscriber): () => void {
    if (!issueSubscribers.has(id)) {
      issueSubscribers.set(id, []);
    }
    issueSubscribers.get(id)!.push(callback);
    
    const issue = currentIssues.find(r => r.id === id) || null;
    
    // Support artificial development delay for skeleton load testing
    if (typeof window !== 'undefined' && localStorage.getItem('dev_artificial_delay')) {
      const ms = parseInt(localStorage.getItem('dev_artificial_delay') || '0', 10);
      if (ms > 0) {
        setTimeout(() => callback(issue ? { ...issue } : null), ms);
      } else {
        callback(issue ? { ...issue } : null);
      }
    } else {
      callback(issue ? { ...issue } : null);
    }
    
    if (issueSubscribers.get(id)!.length === 1 && isFirebaseConfigured) {
      const unsub = onSnapshot(doc(db, 'issues', id), (snapshot: any) => {
        const data = snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Issue) : null;
        const subs = issueSubscribers.get(id) || [];
        subs.forEach(sub => sub(data ? { ...data } : null));
      }, (err: any) => {
        console.error(`Error listening to issue ${id}:`, err);
      });
      issueUnsubscribes.set(id, unsub);
    }
    
    return () => {
      const subs = issueSubscribers.get(id) || [];
      const updatedSubs = subs.filter(sub => sub !== callback);
      issueSubscribers.set(id, updatedSubs);
      
      if (updatedSubs.length === 0) {
        const unsub = issueUnsubscribes.get(id);
        if (unsub) {
          unsub();
          issueUnsubscribes.delete(id);
        }
      }
    };
  },

  /**
   * Fetch all active issues
   */
  async getAll(): Promise<Issue[]> {
    await optionalDelay();
    if (!isFirebaseConfigured) {
      return [...currentIssues];
    }

    try {
      await ensureSeedData();
      const snapshot = await getDocs(collection(db, 'issues'));
      const issues = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Issue));
      return issues;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'issues');
      return [];
    }
  },

  /**
   * Fetch a specific issue by ID
   */
  async getById(id: string): Promise<Issue | null> {
    await optionalDelay();
    if (!isFirebaseConfigured) {
      const issue = currentIssues.find((r) => r.id === id);
      return issue ? { ...issue } : null;
    }

    try {
      const snapshot = await getDoc(doc(db, 'issues', id));
      return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as Issue) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `issues/${id}`);
      return null;
    }
  },

  /**
   * Create a new issue report
   */
  async create(issue: Omit<Issue, 'id'>): Promise<Issue> {
    const newId = `issue-${Date.now()}`;
    const createdIssue: Issue = {
      ...issue,
      id: newId,
    };

    if (!isFirebaseConfigured) {
      currentIssues = [createdIssue, ...currentIssues];
      subscribers.forEach(sub => sub([...currentIssues]));
      invalidateCopilotBriefing();
      return createdIssue;
    }

    try {
      const cleanedIssue = cleanUndefined(createdIssue);
      await setDoc(doc(db, 'issues', newId), cleanedIssue);
      invalidateCopilotBriefing();
      return createdIssue;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${newId}`);
      throw err;
    }
  },

  /**
   * Update an existing issue report
   */
  async update(id: string, updates: Partial<Issue>): Promise<Issue> {
    const statusChanged = updates.status !== undefined;
    const isCritical = updates.urgency === 'Critical' || (currentIssues.find(i => i.id === id)?.urgency === 'Critical');
    if (statusChanged && isCritical) {
      invalidateCopilotBriefing();
    }

    if (!isFirebaseConfigured) {
      const idx = currentIssues.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`Issue ${id} not found.`);
      const updatedIssue = { ...currentIssues[idx], ...updates };
      currentIssues[idx] = updatedIssue;
      subscribers.forEach(sub => sub([...currentIssues]));
      const subs = issueSubscribers.get(id);
      if (subs) subs.forEach(sub => sub({ ...updatedIssue }));
      return updatedIssue;
    }

    try {
      const issueRef = doc(db, 'issues', id);
      const cleanedUpdates = cleanUndefined(updates);
      await updateDoc(issueRef, cleanedUpdates);
      
      const updatedSnap = await getDoc(issueRef);
      return updatedSnap.data() as Issue;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
      throw err;
    }
  },

  /**
   * Delete an issue report
   */
  async delete(id: string): Promise<boolean> {
    if (!isFirebaseConfigured) {
      const originalLength = currentIssues.length;
      currentIssues = currentIssues.filter((r) => r.id !== id);
      const success = currentIssues.length < originalLength;
      if (success) {
        subscribers.forEach(sub => sub([...currentIssues]));
        const subs = issueSubscribers.get(id);
        if (subs) subs.forEach(sub => sub(null));
      }
      return success;
    }

    try {
      await deleteDoc(doc(db, 'issues', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `issues/${id}`);
      return false;
    }
  },

  /**
   * Add comment to a report
   */
  async addComment(issueId: string, content: string, authorName: string, authorBadge?: string): Promise<Comment> {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      issueId,
      authorName,
      authorBadge,
      content,
      timestamp: 'Just now',
      likes: 0,
    };

    if (!isFirebaseConfigured) {
      const idx = currentIssues.findIndex((r) => r.id === issueId);
      if (idx !== -1) {
        const issue = { ...currentIssues[idx] };
        issue.comments = [...(issue.comments || []), newComment];
        issue.commentsCount = issue.comments.length;
        currentIssues[idx] = issue;
        subscribers.forEach(sub => sub([...currentIssues]));
        const subs = issueSubscribers.get(issueId);
        if (subs) subs.forEach(sub => sub({ ...issue }));
      }
      return newComment;
    }

    try {
      const issueRef = doc(db, 'issues', issueId);
      const issueSnap = await getDoc(issueRef);
      if (issueSnap.exists()) {
        const issue = issueSnap.data() as Issue;
        const updatedComments = [...(issue.comments || []), newComment];
        await updateDoc(issueRef, { 
          comments: updatedComments,
          commentsCount: updatedComments.length 
        });
      }
      return newComment;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${issueId}/comments`);
      throw err;
    }
  },

  /**
   * Upvote a report
   */
  async upvote(id: string): Promise<number> {
    if (!isFirebaseConfigured) {
      const idx = currentIssues.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`Issue ${id} not found.`);
      const issue = { ...currentIssues[idx] };
      issue.upvotes = (issue.upvotes || 0) + 1;
      currentIssues[idx] = issue;
      subscribers.forEach(sub => sub([...currentIssues]));
      const subs = issueSubscribers.get(id);
      if (subs) subs.forEach(sub => sub({ ...issue }));
      return issue.upvotes;
    }

    try {
      const issueRef = doc(db, 'issues', id);
      const issueSnap = await getDoc(issueRef);
      if (issueSnap.exists()) {
        const issue = issueSnap.data() as Issue;
        const newUpvotes = (issue.upvotes || 0) + 1;
        await updateDoc(issueRef, { upvotes: newUpvotes });
        return newUpvotes;
      }
      return 0;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
      throw err;
    }
  },
};
