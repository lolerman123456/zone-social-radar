
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setError(null); // Clear any previous errors
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        // Parse Firebase error messages to be more user-friendly
        let errorMessage = error.message;
        if (errorMessage.includes('auth/invalid-credential')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('auth/user-not-found')) {
          errorMessage = 'No account found with this email. Please sign up.';
        } else if (errorMessage.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Invalid email format. Please check and try again.';
        }
        
        setError(errorMessage);
      } else {
        setError('An unknown error occurred during sign in');
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setError(null); // Clear any previous errors
      return result.user;
    } catch (error) {
      console.error('Sign up error:', error);
      if (error instanceof Error) {
        // Parse Firebase error messages to be more user-friendly
        let errorMessage = error.message;
        if (errorMessage.includes('auth/email-already-in-use')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (errorMessage.includes('auth/weak-password')) {
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Invalid email format. Please check and try again.';
        }
        
        setError(errorMessage);
      } else {
        setError('An unknown error occurred during sign up');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setError(null); // Clear any previous errors
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      if (error instanceof Error) {
        // Parse Firebase error messages to be more user-friendly
        let errorMessage = error.message;
        if (errorMessage.includes('popup-closed-by-user')) {
          errorMessage = 'Sign-in cancelled. Please try again.';
        } else if (errorMessage.includes('account-exists-with-different-credential')) {
          errorMessage = 'An account already exists with the same email but different sign-in credentials.';
        }
        
        setError(errorMessage);
      } else {
        setError('An unknown error occurred during Google sign in');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Sign out error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign out');
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    error,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
