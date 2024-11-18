import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { app } from "../firebaseConfig"; // Adjust the path if needed

const auth = getAuth(app);

// Type definitions
interface UserSignupData {
  email: string;
  password: string;
  isVendor?: boolean; // Optional field to indicate if the user is a vendor
}

// Function to sign up a new user
export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Function to sign in an existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Function to sign out the user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Function to monitor authentication state
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      callback(null);
    }
  });
};
