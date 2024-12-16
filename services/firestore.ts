import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app

// Initialize Firestore
export const db = getFirestore(app);

// Function to save user data
export const saveUserData = async (
  uid: string,
  data: { email: string; name: string; isVendor: boolean }
): Promise<void> => {
  try {
    console.log("isVendor:", data.isVendor);

    if(data.isVendor){
      await setDoc(doc(db, "vendors", uid), data);
      console.log("Vendor data saved successfully");
    }else{
      await setDoc(doc(db, "users", uid), data);
      console.log("User data saved successfully");
    }
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Function to fetch user data
// Function to fetch user or vendor data
export const getUserData = async (uid: string): Promise<any> => {
  try {
    // Try to fetch from the "users" collection
    let userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    // If not found, try to fetch from the "vendors" collection
    userDoc = await getDoc(doc(db, "vendors", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    // If no document is found in both collections
    console.warn("No user or vendor data found");
    return null;
  } catch (error) {
    console.error("Error fetching user or vendor data:", error);
    throw error;
  }
};

// Function to update user data
export const updateUserData = async (
  uid: string,
  updates: Partial<{ email: string; name: string; isVendor: boolean }>
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", uid), updates);
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};
