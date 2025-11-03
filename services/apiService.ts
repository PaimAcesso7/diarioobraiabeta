import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged as onFirebaseAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    limit,
    writeBatch,
    Timestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Project, Constructor, PlatformSettings, LogData, FullLog, Task } from '../types';

// --- Auth Listener ---
// Provides a real-time subscription to the user's authentication state.
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
    return onFirebaseAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            // User is signed in, get their profile from Firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Firestore timestamps need to be converted to JS numbers
                const trialEndsAt = userData.trialEndsAt instanceof Timestamp 
                    ? userData.trialEndsAt.toMillis() 
                    : userData.trialEndsAt;
                
                callback({ id: userDocSnap.id, ...userData, trialEndsAt } as User);
            } else {
                 console.error("User authenticated but no data found in Firestore.");
                callback(null); // Or handle this case by creating a user profile
            }
        } else {
            // User is signed out
            callback(null);
        }
    });
};

// --- User Management ---

const ADMIN_EMAIL = 'acessoplatform@gmail.com';

// Ensure default admin exists
const ensureAdminExists = async () => {
    const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        console.log("Admin user not found, creating one...");
        try {
            // This is a special case for first-time setup.
            // In a real app, this should be done via a secure backend script.
            const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, 'admin');
            const adminUser: Omit<User, 'id' | 'password'> = {
                email: ADMIN_EMAIL,
                name: 'Administrador',
                whatsapp: '00000000000',
                role: 'admin',
                accessLevel: 'full',
                trialEndsAt: null,
            };
            await setDoc(doc(db, "users", userCredential.user.uid), adminUser);
            console.log("Admin user created successfully.");
        } catch (error) {
            console.error("Error creating admin user:", error);
        }
    }
};

// Call this once, perhaps on app startup (e.g., in App.tsx) or here.
ensureAdminExists();


// Fix: Make currentUser optional to allow fetching all users in specific contexts.
export const fetchUsers = async (currentUser?: User): Promise<User[]> => {
    let q;
    // If no user is provided, or the user is an admin, fetch all users.
    if (!currentUser || currentUser.role === 'admin') {
        q = query(collection(db, 'users'));
    } else if (currentUser.role === 'gestor') {
        q = query(collection(db, 'users'), where('createdBy', '==', currentUser.id));
    } else {
        return []; // Campo users don't fetch user lists.
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const saveAllUsers = async (users: User[]): Promise<void> => {
    const batch = writeBatch(db);
    users.forEach(user => {
        const { id, ...userData } = user;
        // The password should have been handled on creation and not be present here.
        delete (userData as any).password; 
        const docRef = doc(db, 'users', id);
        batch.set(docRef, userData, { merge: true });
    });
    await batch.commit();
};


export const loginUser = async (email: string, password_plaintext: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password_plaintext);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
        throw new Error("Usuário autenticado, mas sem dados de perfil. Contate o suporte.");
    }
    return { id: userDocSnap.id, ...userDocSnap.data() } as User;
};

export const logoutUser = async (): Promise<void> => {
    await signOut(auth);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    if (!userData.password) {
        throw new Error("Senha é obrigatória para criar um novo usuário.");
    }

    const allUsersSnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', userData.email)));
    if (!allUsersSnapshot.empty) {
        throw new Error("Este e-mail já está cadastrado.");
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const { password, ...userDataToSave } = userData;

    const newUser: Omit<User, 'id'> = {
        ...userDataToSave,
        trialEndsAt: userData.trialEndsAt ? Timestamp.fromMillis(userData.trialEndsAt) : null
    };

    await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    return { id: userCredential.user.uid, ...newUser } as User;
};

export const deleteUser = async (userId: string): Promise<void> => {
    // Note: Deleting a user from Firebase Auth is a privileged operation
    // and should be handled by a backend (Cloud Function).
    // Here we only delete the Firestore record.
    await deleteDoc(doc(db, 'users', userId));
};

// --- Project Management ---

export const fetchProjects = async (currentUser: User): Promise<Project[]> => {
    const q = query(collection(db, 'projects'));
    const querySnapshot = await getDocs(q);
    let projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    if (currentUser.role === 'campo') {
        projects = projects.filter(p => currentUser.assignedProjectIds?.includes(p.id));
    }
    
    return projects;
};

export const saveAllProjects = async (projects: Project[]): Promise<void> => {
    // This is an inefficient operation for Firestore, but matches the old API.
    // A better approach would be granular add/update/delete functions.
    // For now, we overwrite the collection based on the provided array.
    // A more robust implementation would diff the arrays. For simplicity:
    const batch = writeBatch(db);
    projects.forEach(project => {
        const docRef = doc(db, 'projects', project.id);
        batch.set(docRef, project);
    });
    await batch.commit();
};

// --- Constructor Management ---
export const fetchConstructors = async (): Promise<Constructor[]> => {
    const querySnapshot = await getDocs(collection(db, 'constructors'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Constructor));
};

export const saveAllConstructors = async (constructors: Constructor[]): Promise<void> => {
    const batch = writeBatch(db);
    constructors.forEach(c => {
        const docRef = doc(db, 'constructors', c.id);
        batch.set(docRef, c);
    });
    await batch.commit();
};

// --- Platform Settings ---
export const fetchPlatformSettings = async (): Promise<PlatformSettings> => {
    const docRef = doc(db, 'settings', 'platform');
    const docSnap = await getDoc(docRef);
    const defaultSettings: PlatformSettings = { 
        name: 'Diário de Obra Inteligente', 
        logo: '',
        termsOfService: '',
        privacyPolicy: ''
    };
    return docSnap.exists() ? { ...defaultSettings, ...docSnap.data() } as PlatformSettings : defaultSettings;
};

export const savePlatformSettings = async (settings: PlatformSettings): Promise<void> => {
    await setDoc(doc(db, 'settings', 'platform'), settings);
};

// --- Daily Log ---
const getLogDocRef = (projectId: string, date: string) => doc(db, `projects/${projectId}/logs`, date);

export const fetchDailyLog = async (projectId: string, date: string): Promise<FullLog | null> => {
    const docRef = getLogDocRef(projectId, date);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as FullLog : null;
};

export const saveDailyLog = async (projectId: string, date: string, logData: FullLog): Promise<void> => {
    const docRef = getLogDocRef(projectId, date);
    await setDoc(docRef, logData, { merge: true });
};

export const findLastLog = async (projectId: string, targetDate: string): Promise<FullLog | null> => {
    const logsCollectionRef = collection(db, `projects/${projectId}/logs`);
    const q = query(
        logsCollectionRef, 
        where('logData.date', '<', targetDate), 
        orderBy('logData.date', 'desc'), 
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return querySnapshot.docs[0].data() as FullLog;
};

export const fetchTaskHistory = async (projectId: string): Promise<Task[]> => {
    const logsCollectionRef = collection(db, `projects/${projectId}/logs`);
    const q = query(logsCollectionRef, orderBy('logData.date', 'desc'), limit(20)); // Get last 20 logs for history
    
    const querySnapshot = await getDocs(q);
    const history: Task[] = [];
    const uniqueTasks = new Map<string, Task>();

    querySnapshot.docs.forEach(doc => {
        const log = doc.data() as FullLog;
        if (log.tasks) {
            log.tasks.forEach(task => {
                 if (task.text && !uniqueTasks.has(task.text.toLowerCase().trim())) {
                    uniqueTasks.set(task.text.toLowerCase().trim(), task);
                }
            });
        }
    });

    return Array.from(uniqueTasks.values());
}