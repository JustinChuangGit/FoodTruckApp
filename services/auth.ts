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
import { setUser, clearUser } from "../redux/authSlice"; // Adjust the path as needed
import { AppDispatch, persistor } from "../redux/store"; // Adjust the path as needed
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, getDoc, doc } from "firebase/firestore"; // Import necessary Firestore methods
import { db } from "@/services/firestore"; // Import the Firestore instance

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

    let fullUserData: any = null;

    // Try to fetch from `users` collection
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      fullUserData = {
        uid: user.uid,
        email: user.email || "",
        ...userData,
      };
    } else {
      // If not in `users`, try `vendors` collection
      const vendorDoc = await getDoc(doc(db, "vendors", user.uid));
      if (vendorDoc.exists()) {
        const vendorData = vendorDoc.data();

        // Fetch menu for vendors
        const menuCollectionRef = collection(db, `vendors/${user.uid}/menu`);
        const menuSnapshot = await getDocs(menuCollectionRef);
        const menu = menuSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        fullUserData = {
          uid: user.uid,
          email: user.email || "",
          ...vendorData, // Include vendor-specific fields
          menu,          // Add menu field
        };
      } else {
        // If not found in both collections
        console.error(`User or vendor document not found for UID: ${user.uid}`);
        throw new Error("User account does not exist. Please sign up.");
      }
    }

    // Dispatch Redux action to update state
    dispatch(setUser(fullUserData));

    return fullUserData; // Return the full user object for further use
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error;
  }
};

// Function to sign out the user
export const signOutUser = async (dispatch: AppDispatch): Promise<void> => {
  try {
    await signOut(auth);

    // Clear Redux store
    dispatch(clearUser());
    console.log("Cleared Redux state");

    // Purge persisted Redux store
    await persistor.purge();
    console.log("Cleared Redux persist state");

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

