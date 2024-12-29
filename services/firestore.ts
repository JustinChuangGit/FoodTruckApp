import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app
import { Alert } from "react-native"; // For React Native prompts (adjust for web if needed)
import { MenuItem } from "@/constants/types"; // Import the MenuItem type

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

    // Reference to the category document
    const categoryRef = doc(db, "vendors", vendorUid, "menu", category);

    // Set the entire category document with the new item map
    await setDoc(categoryRef, {
      [item.id]: item, // Replace the document with this map
    }, {merge: true}); // Merge the new data with existing data
    console.log(`Menu item saved in category '${category}':`, item);
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

export const fetchMenuItems = async (vendorUid: string): Promise<MenuItem[]> => {
  if (!vendorUid) {
    console.error("Vendor UID is undefined.");
    return [];
  }

  try {
    const menuCollectionRef = collection(db, "vendors", vendorUid, "menu");
    const menuCollectionSnapshot = await getDocs(menuCollectionRef);
    const menuItems: MenuItem[] = [];

    // Loop through all category documents
    menuCollectionSnapshot.forEach((categoryDoc) => {
      const category = categoryDoc.id; // Category name (document ID)
      const categoryData = categoryDoc.data(); // Category fields (menu items)

      // Extract all items in the category
      for (const [itemId, itemData] of Object.entries(categoryData)) {
        menuItems.push({
          id: itemId,
          ...(itemData as Omit<MenuItem, "id" | "category">), // Spread item data excluding id and category
          category, // Add the category name
        });
      }
    });

    console.log("Fetched menu items:", menuItems);
    return menuItems;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};