import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  setDoc, 
  getDocFromServer,
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudyPack, QuizAttempt, UserPreferences, User } from '../types';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} else {
  app = getApp();
}

export const auth = getAuth(app);

// Use specified custom database ID if provided, otherwise default
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Startup connection verification test as required by skill
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, utilizing local offline buffer.');
    }
  }
}
testFirestoreConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ==========================================
// FIREBASE AUTHENTICATION HELPERS
// ==========================================

export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;
    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Scholar',
      email: fbUser.email || '',
      isGuest: false,
      avatar: fbUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
    };

    // Save/update user profile in Firestore
    await setDoc(doc(db, 'users', fbUser.uid), user, { merge: true });

    return { success: true, user };
  } catch (err: any) {
    console.error('Google Sign-In error:', err);
    return { success: false, error: err.message || 'Google Sign-In failed.' };
  }
}

export async function signUpWithEmail(name: string, email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = cred.user;

    if (name.trim()) {
      await updateProfile(fbUser, { displayName: name.trim() });
    }

    const user: User = {
      id: fbUser.uid,
      name: name.trim() || fbUser.email?.split('@')[0] || 'Scholar',
      email: fbUser.email || email,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', fbUser.uid), user, { merge: true });

    return { success: true, user };
  } catch (err: any) {
    console.error('Email sign up error:', err);
    let msg = 'Sign up failed.';
    if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please log in.';
    if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
    if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
    return { success: false, error: msg };
  }
}

export async function logInWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const fbUser = cred.user;

    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Scholar',
      email: fbUser.email || email,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    return { success: true, user };
  } catch (err: any) {
    console.error('Email login error:', err);
    let msg = 'Log in failed.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      msg = 'Invalid email or password.';
    }
    return { success: false, error: msg };
  }
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send password reset email.' };
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      // Fetch profile from Firestore
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          callback(snap.data() as User);
          return;
        }
      } catch {
        // fallback
      }
      callback({
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Scholar',
        email: fbUser.email || '',
        isGuest: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      callback(null);
    }
  });
}

// ==========================================
// FIRESTORE USER-ISOLATED DATA REPOSITORIES
// users/{userId}/studyPacks/{studyPackId}
// users/{userId}/quizzes/{quizId}
// users/{userId}/chatSessions/{chatSessionId}
// users/{userId}/settings/preferences
// ==========================================

export async function saveFirestoreStudyPack(userId: string, pack: StudyPack): Promise<void> {
  if (!userId || userId.startsWith('guest-') || pack.isDemo) return;
  try {
    const packRef = doc(db, 'users', userId, 'studyPacks', pack.id);
    await setDoc(packRef, { ...pack, userId, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Failed to save study pack to Firestore:', err);
  }
}

export async function getFirestoreStudyPacks(userId: string): Promise<StudyPack[]> {
  if (!userId || userId.startsWith('guest-')) return [];
  try {
    const packsRef = collection(db, 'users', userId, 'studyPacks');
    const snap = await getDocs(packsRef);
    const packs: StudyPack[] = [];
    snap.forEach((d) => {
      const data = d.data() as StudyPack;
      if (!data.isDemo && data.id !== 'demo-physics-projectile') {
        packs.push(data);
      }
    });
    return packs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Failed to get study packs from Firestore:', err);
    return [];
  }
}

export async function deleteFirestoreStudyPack(userId: string, packId: string): Promise<boolean> {
  if (!userId || userId.startsWith('guest-')) return true;
  try {
    const packRef = doc(db, 'users', userId, 'studyPacks', packId);
    await deleteDoc(packRef);
    return true;
  } catch (err) {
    console.error('Failed to delete study pack from Firestore:', err);
    return false;
  }
}

export async function saveFirestoreQuizAttempt(userId: string, attempt: QuizAttempt): Promise<void> {
  if (!userId || userId.startsWith('guest-')) return;
  try {
    const ref = doc(db, 'users', userId, 'quizzes', attempt.id);
    await setDoc(ref, { ...attempt, userId }, { merge: true });
  } catch (err) {
    console.error('Failed to save quiz attempt to Firestore:', err);
  }
}

export async function getFirestoreQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  if (!userId || userId.startsWith('guest-')) return [];
  try {
    const ref = collection(db, 'users', userId, 'quizzes');
    const snap = await getDocs(ref);
    const attempts: QuizAttempt[] = [];
    snap.forEach((d) => {
      attempts.push(d.data() as QuizAttempt);
    });
    return attempts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error('Failed to get quiz attempts from Firestore:', err);
    return [];
  }
}

// Chat Sessions
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isGrounded?: boolean;
  groundingSources?: { title: string; url: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  studyPackId?: string;
  studyPackTitle?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export async function saveFirestoreChatSession(userId: string, session: ChatSession): Promise<void> {
  if (!userId || userId.startsWith('guest-')) return;
  try {
    const ref = doc(db, 'users', userId, 'chatSessions', session.id);
    await setDoc(ref, session, { merge: true });
  } catch (err) {
    console.error('Failed to save chat session to Firestore:', err);
  }
}

export async function getFirestoreChatSessions(userId: string): Promise<ChatSession[]> {
  if (!userId || userId.startsWith('guest-')) return [];
  try {
    const ref = collection(db, 'users', userId, 'chatSessions');
    const snap = await getDocs(ref);
    const sessions: ChatSession[] = [];
    snap.forEach((d) => {
      sessions.push(d.data() as ChatSession);
    });
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (err) {
    console.error('Failed to get chat sessions from Firestore:', err);
    return [];
  }
}

export async function deleteFirestoreChatSession(userId: string, sessionId: string): Promise<boolean> {
  if (!userId || userId.startsWith('guest-')) return true;
  try {
    const ref = doc(db, 'users', userId, 'chatSessions', sessionId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('Failed to delete chat session from Firestore:', err);
    return false;
  }
}

export async function saveFirestoreSettings(userId: string, settings: UserPreferences): Promise<void> {
  if (!userId || userId.startsWith('guest-')) return;
  try {
    const ref = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(ref, settings, { merge: true });
  } catch (err) {
    console.error('Failed to save settings to Firestore:', err);
  }
}

export async function getFirestoreSettings(userId: string): Promise<UserPreferences | null> {
  if (!userId || userId.startsWith('guest-')) return null;
  try {
    const ref = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserPreferences) : null;
  } catch (err) {
    console.error('Failed to get settings from Firestore:', err);
    return null;
  }
}
