import {
  initializeAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getReactNativePersistence,
} from "firebase/auth";
import { app } from "../firebaseConfig"; // Adjust the path if needed
import { saveUserData, getUserData } from "./firestore"; // Adjust the path as needed
import { setUser } from "../redux/authSlice"; // Adjust the path as needed
import { AppDispatch } from "../redux/store"; // Adjust the path as needed
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
// Type definitions
interface UserSignupData {
  email: string;
  password: string;
  isVendor?: boolean; // Optional field to indicate if the user is a vendor
}

// Function to sign up a new user

export const signUp = async (
  dispatch: AppDispatch, // Pass dispatch
  email: string,
  password: string,
  isVendor: boolean,
  name: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional user data in Firestore
    await saveUserData(user.uid, { email, name, isVendor });

    // Dispatch Redux action to update state
    dispatch(setUser({ uid: user.uid, email, name, isVendor }));

    return user;
  } catch (error) {
    console.error("Error during sign-up:", error);
    throw error;
  }
};


// Function to sign in an existing user
export const signIn = async (dispatch: AppDispatch, email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch additional user data from Firestore
    const userData = await getUserData(user.uid);

    // Update Redux state
    dispatch(setUser({ uid: user.uid, email: user.email, ...userData }));

    return { uid: user.uid, email: user.email, ...userData }; // Include `isVendor` in return
  } catch (error) {
    console.error("Error during sign-in:", error);
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

export const onAuthStateChange = (
  callback: (user: { uid: string; email: string; isVendor: boolean } | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            isVendor: userData.isVendor || false,
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

