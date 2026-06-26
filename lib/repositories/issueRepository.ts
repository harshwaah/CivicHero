import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
import { Issue, Comment } from '../models';
import { mockReports } from '../mockReports';

// Fallback in-memory store for simulation purposes
let localReports: Issue[] = [...(mockReports as any as Issue[])];

export const IssueRepository = {
  /**
   * Fetch all active issues
   */
  async getAll(): Promise<Issue[]> {
    if (!isFirebaseConfigured) {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 100));
      return localReports;
    }

    try {
      // Future Firebase Query Implementation
      // const q = query(collection(db, 'issues'), orderBy('timestamp', 'desc'));
      // const snap = await getDocs(q);
      // return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Issue));
      return localReports;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'issues');
    }
  },

  /**
   * Fetch a specific issue by ID
   */
  async getById(id: string): Promise<Issue | null> {
    if (!isFirebaseConfigured) {
      const issue = localReports.find((r) => r.id === id);
      return issue || null;
    }

    try {
      // Future Firebase Get Implementation
      // const docRef = doc(db, 'issues', id);
      // const snap = await getDoc(docRef);
      // return snap.exists() ? ({ id: snap.id, ...snap.data() } as Issue) : null;
      const issue = localReports.find((r) => r.id === id);
      return issue || null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `issues/${id}`);
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
      localReports = [createdIssue, ...localReports];
      return createdIssue;
    }

    try {
      // Future Firebase Set Implementation
      // await setDoc(doc(db, 'issues', newId), createdIssue);
      localReports = [createdIssue, ...localReports];
      return createdIssue;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${newId}`);
    }
  },

  /**
   * Update an existing issue report
   */
  async update(id: string, updates: Partial<Issue>): Promise<Issue> {
    const idx = localReports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Issue ${id} not found.`);

    const updatedIssue = {
      ...localReports[idx],
      ...updates,
    };

    if (!isFirebaseConfigured) {
      localReports[idx] = updatedIssue;
      return updatedIssue;
    }

    try {
      // Future Firebase Update Implementation
      // await updateDoc(doc(db, 'issues', id), updates);
      localReports[idx] = updatedIssue;
      return updatedIssue;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
    }
  },

  /**
   * Delete an issue report
   */
  async delete(id: string): Promise<boolean> {
    const originalLength = localReports.length;
    localReports = localReports.filter((r) => r.id !== id);
    const success = localReports.length < originalLength;

    if (!isFirebaseConfigured) {
      return success;
    }

    try {
      // Future Firebase Delete Implementation
      // await deleteDoc(doc(db, 'issues', id));
      return success;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `issues/${id}`);
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

    const issue = localReports.find((r) => r.id === issueId);
    if (issue) {
      if (!issue.comments) issue.comments = [];
      issue.comments.push(newComment);
      issue.commentsCount = issue.comments.length;
    }

    if (!isFirebaseConfigured) {
      return newComment;
    }

    try {
      // Future Subcollection Implementation
      // await addDoc(collection(db, 'issues', issueId, 'comments'), newComment);
      return newComment;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${issueId}/comments`);
    }
  },

  /**
   * Upvote a report
   */
  async upvote(id: string): Promise<number> {
    const issue = localReports.find((r) => r.id === id);
    if (!issue) throw new Error(`Issue ${id} not found.`);

    issue.upvotes += 1;

    if (!isFirebaseConfigured) {
      return issue.upvotes;
    }

    try {
      // Future Atomicity / Transaction / Increment Implementation
      // await updateDoc(doc(db, 'issues', id), { upvotes: increment(1) });
      return issue.upvotes;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
    }
  },
};
