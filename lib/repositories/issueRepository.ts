import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
import { Issue, Comment } from '../models';
import { mockReports } from '../mockReports';

type Subscriber = (issues: Issue[]) => void;
type IssueSubscriber = (issue: Issue | null) => void;

let subscribers: Subscriber[] = [];
const issueSubscribers: Map<string, IssueSubscriber[]> = new Map();

// Helper to get or initialize the global singleton store
const getStore = (): Issue[] => {
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any).__CIVIC_HERO_REPORTS__) {
      (globalThis as any).__CIVIC_HERO_REPORTS__ = JSON.parse(JSON.stringify(mockReports));
    }
    return (globalThis as any).__CIVIC_HERO_REPORTS__;
  }
  // Fallback if globalThis is unavailable
  return JSON.parse(JSON.stringify(mockReports));
};

const setStore = (newReports: Issue[]) => {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__CIVIC_HERO_REPORTS__ = newReports;
  }
};

function notifySubscribers() {
  const store = getStore();
  subscribers.forEach(sub => sub([...store]));
}

function notifyIssueSubscribers(id: string) {
  const store = getStore();
  const issue = store.find(r => r.id === id) || null;
  const subs = issueSubscribers.get(id);
  if (subs) {
    subs.forEach(sub => sub(issue ? { ...issue } : null));
  }
}

export const IssueRepository = {
  subscribe(callback: Subscriber): () => void {
    subscribers.push(callback);
    callback([...getStore()]);
    return () => {
      subscribers = subscribers.filter(sub => sub !== callback);
    };
  },

  subscribeToIssue(id: string, callback: IssueSubscriber): () => void {
    if (!issueSubscribers.has(id)) {
      issueSubscribers.set(id, []);
    }
    issueSubscribers.get(id)!.push(callback);
    const issue = getStore().find(r => r.id === id) || null;
    callback(issue ? { ...issue } : null);
    
    return () => {
      const subs = issueSubscribers.get(id) || [];
      issueSubscribers.set(id, subs.filter(sub => sub !== callback));
    };
  },

  /**
   * Fetch all active issues
   */
  async getAll(): Promise<Issue[]> {
    if (!isFirebaseConfigured) {
      return [...getStore()];
    }

    try {
      return [...getStore()];
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'issues');
      return [];
    }
  },

  /**
   * Fetch a specific issue by ID
   */
  async getById(id: string): Promise<Issue | null> {
    if (!isFirebaseConfigured) {
      const issue = getStore().find((r) => r.id === id);
      return issue ? { ...issue } : null;
    }

    try {
      const issue = getStore().find((r) => r.id === id);
      return issue ? { ...issue } : null;
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
      const store = getStore();
      setStore([createdIssue, ...store]);
      notifySubscribers();
      return createdIssue;
    }

    try {
      const store = getStore();
      setStore([createdIssue, ...store]);
      notifySubscribers();
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
    const store = getStore();
    const idx = store.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Issue ${id} not found.`);

    const updatedIssue = {
      ...store[idx],
      ...updates,
    };

    if (!isFirebaseConfigured) {
      store[idx] = updatedIssue;
      setStore(store);
      notifySubscribers();
      notifyIssueSubscribers(id);
      return updatedIssue;
    }

    try {
      store[idx] = updatedIssue;
      setStore(store);
      notifySubscribers();
      notifyIssueSubscribers(id);
      return updatedIssue;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
      throw err;
    }
  },

  /**
   * Delete an issue report
   */
  async delete(id: string): Promise<boolean> {
    const store = getStore();
    const originalLength = store.length;
    const newStore = store.filter((r) => r.id !== id);
    const success = newStore.length < originalLength;

    if (!isFirebaseConfigured) {
      if (success) {
        setStore(newStore);
        notifySubscribers();
        notifyIssueSubscribers(id);
      }
      return success;
    }

    try {
      if (success) {
        setStore(newStore);
        notifySubscribers();
        notifyIssueSubscribers(id);
      }
      return success;
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

    const store = getStore();
    const idx = store.findIndex((r) => r.id === issueId);
    if (idx !== -1) {
      const issue = { ...store[idx] };
      issue.comments = [...(issue.comments || []), newComment];
      issue.commentsCount = issue.comments.length;
      store[idx] = issue;
      setStore(store);
      notifySubscribers();
      notifyIssueSubscribers(issueId);
    }

    if (!isFirebaseConfigured) {
      return newComment;
    }

    try {
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
    const store = getStore();
    const idx = store.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Issue ${id} not found.`);

    const issue = { ...store[idx] };
    issue.upvotes = (issue.upvotes || 0) + 1;
    store[idx] = issue;
    setStore(store);

    if (!isFirebaseConfigured) {
      notifySubscribers();
      notifyIssueSubscribers(id);
      return issue.upvotes;
    }

    try {
      notifySubscribers();
      notifyIssueSubscribers(id);
      return issue.upvotes;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
      throw err;
    }
  },
};
