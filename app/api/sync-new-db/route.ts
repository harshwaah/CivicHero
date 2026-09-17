import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebase';
import { firebaseConfig } from '@/lib/config';
import { doc, setDoc } from 'firebase/firestore';
import { allBackupIssues, allBackupUsers, allBackupNotifications } from '@/lib/backupData';

export async function POST() {
  try {
    let syncedIssues = 0;
    let syncedUsers = 0;
    let syncedNotifications = 0;

    for (const issue of allBackupIssues) {
      try {
        await setDoc(doc(db, 'issues', issue.id), issue);
        syncedIssues++;
      } catch (e) {
        console.error(`Error writing issue ${issue.id}:`, e);
      }
    }

    for (const user of allBackupUsers) {
      try {
        const uid = user.uid || (user as any).id;
        await setDoc(doc(db, 'users', uid), user);
        syncedUsers++;
      } catch (e) {
        console.error(`Error writing user:`, e);
      }
    }

    for (const notif of allBackupNotifications) {
      try {
        await setDoc(doc(db, 'notifications', notif.id), notif);
        syncedNotifications++;
      } catch (e) {
        console.error(`Error writing notification ${notif.id}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database synchronization executed.`,
      details: {
        syncedIssues,
        totalIssues: allBackupIssues.length,
        syncedUsers,
        totalUsers: allBackupUsers.length,
        syncedNotifications,
        totalNotifications: allBackupNotifications.length,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Database sync failed'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    targetProject: firebaseConfig.projectId,
    dataAvailable: {
      issues: allBackupIssues.length,
      users: allBackupUsers.length,
      notifications: allBackupNotifications.length
    }
  });
}
