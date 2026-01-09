import { create } from 'zustand';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthStore } from '@/types/auth';
import { mapFirebaseUser } from '@/types/auth';

// Helper function to get user-friendly error messages
const getErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';

    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled. Please contact support.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed. Please try again.';
        default:
            return error?.message || 'An error occurred. Please try again.';
    }
};

export const useAuthStore = create<AuthStore>((set) => {
    // Initialize auth state listener
    onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            set({
                user: mapFirebaseUser(firebaseUser),
                loading: false,
                initialized: true,
            });
        } else {
            set({
                user: null,
                loading: false,
                initialized: true,
            });
        }
    });

    return {
        // Initial state
        user: null,
        loading: false,
        error: null,
        initialized: false,

        // Sign up with email and password
        signUp: async (email: string, password: string, displayName?: string) => {
            set({ loading: true, error: null });
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Update display name if provided
                if (displayName && userCredential.user) {
                    await updateProfile(userCredential.user, { displayName });
                }

                set({
                    user: mapFirebaseUser(userCredential.user),
                    loading: false,
                });
            } catch (error: any) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, loading: false });
                throw new Error(errorMessage);
            }
        },

        // Sign in with email and password
        signIn: async (email: string, password: string) => {
            set({ loading: true, error: null });
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                set({
                    user: mapFirebaseUser(userCredential.user),
                    loading: false,
                });
            } catch (error: any) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, loading: false });
                throw new Error(errorMessage);
            }
        },

        // Sign in with Google
        signInWithGoogle: async () => {
            set({ loading: true, error: null });
            try {
                const provider = new GoogleAuthProvider();
                const userCredential = await signInWithPopup(auth, provider);
                set({
                    user: mapFirebaseUser(userCredential.user),
                    loading: false,
                });
            } catch (error: any) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, loading: false });
                throw new Error(errorMessage);
            }
        },

        // Sign out
        signOut: async () => {
            set({ loading: true, error: null });
            try {
                await firebaseSignOut(auth);
                set({
                    user: null,
                    loading: false,
                });
            } catch (error: any) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, loading: false });
                throw new Error(errorMessage);
            }
        },

        // Reset password
        resetPassword: async (email: string) => {
            set({ loading: true, error: null });
            try {
                await sendPasswordResetEmail(auth, email);
                set({ loading: false });
            } catch (error: any) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, loading: false });
                throw new Error(errorMessage);
            }
        },

        // Setters for manual state updates
        setUser: (user) => set({ user }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        setInitialized: (initialized) => set({ initialized }),
    };
});
