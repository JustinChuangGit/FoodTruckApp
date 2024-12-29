import { getFirestore, doc, setDoc, getDoc, updateDoc, collection } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app
import { Alert } from "react-native"; // For React Native prompts (adjust for web if needed)

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

export const saveMenuItem = async (
  vendorUid: string | undefined,
  category: string,
  item: { id: string; name: string; price: number; description: string }
): Promise<void> => {
  try {
    // Validate vendorUid
    if (!vendorUid) {
      throw new Error("Invalid vendor UID. Please log out and log back in.");
    }

    // Firestore path: vendors/{vendorUid}/menu/{category}/{item.id}
    const itemRef = doc(
      collection(db, "vendors", vendorUid, "menu", category, "items"),
      item.id
    );
    
    await setDoc(itemRef, item);
    console.log("Menu item saved successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error saving menu item:", error);

      if (error.message === "Invalid vendor UID. Please log out and log back in.") {
        Alert.alert(
          "Authentication Error",
          "Your session seems to be invalid. Please log out and log back in.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to save the menu item. Please try again later.",
          [{ text: "OK" }]
        );
      }
    } else {
      console.error("Unknown error occurred:", error);
      Alert.alert(
        "Error",
        "An unknown error occurred. Please try again later.",
        [{ text: "OK" }]
      );
    }

    throw error; // Re-throw the error if needed
  }
};