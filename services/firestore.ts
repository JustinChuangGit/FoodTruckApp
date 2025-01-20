import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteField } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app
import { Alert } from "react-native"; // For React Native prompts (adjust for web if needed)
import { MenuItem } from "@/constants/types"; // Import the MenuItem type

// Initialize Firestore
export const db = getFirestore(app);

// Function to save user data
export const saveUserData = async (
  uid: string,
  data: { email: string; name: string; isVendor: boolean, phone: string }
): Promise<void> => {
  try {
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

export const fetchMenuItems = async (vendorUid: string | undefined): Promise<MenuItem[]> => {
  if (!vendorUid) {
    console.error("Vendor UID is undefined.");
    return [];
  }

  try {
    const menuCollectionRef = collection(db, "vendors", vendorUid, "menu");
    const menuCollectionSnapshot = await getDocs(menuCollectionRef);
    const menuItems: MenuItem[] = [];

    menuCollectionSnapshot.forEach((categoryDoc) => {
      const category = categoryDoc.id;
      const categoryData = categoryDoc.data();

      for (const [itemId, itemData] of Object.entries(categoryData)) {
        menuItems.push({
          id: itemId,
          ...(itemData as Omit<MenuItem, "id" | "category">),
          category,
        });
      }
    });

    return menuItems;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};


export const deleteMenuItem = async (
  vendorUid: string | undefined,
  category: string,
  itemId: string
): Promise<void> => {
  try {
    // Validate vendorUid
    if (!vendorUid) {
      throw new Error("Invalid vendor UID. Please log out and log back in.");
    }

    // Reference to the category document
    const categoryRef = doc(db, "vendors", vendorUid, "menu", category);

    // Delete the item field
    await updateDoc(categoryRef, {
      [itemId]: deleteField(), // Remove the field by its ID
    });

    Alert.alert("Success", "Item deleted successfully!");
    console.log(`Deleted item '${itemId}' from category '${category}'`);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid vendor UID. Please log out and log back in.") {
      Alert.alert(
        "Authentication Error",
        "Your session seems to be invalid. Please log out and log back in.",
        [{ text: "OK" }]
      );
    } else {
      console.error("Error deleting menu item:", error);
      Alert.alert("Error", "Could not delete the menu item. Please try again.");
    }
  }
};

export const getVendorInfo = async (uid: string) => {
  try {
    const vendorDoc = await getDoc(doc(db, "vendors", uid));
    if (vendorDoc.exists()) {
      return { uid, ...vendorDoc.data() }; // Return vendor details with UID
    } else {
      console.error(`No vendor found with UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching vendor info for UID: ${uid}`, error);
    return null;
  }
};

export const updateVendorAccountData = async (
  uid: string,
  updates: Partial<{
    price: string;
    vendorType: string;
    name: string;
    description: string;
    image: string | null;
  }>
): Promise<void> => {
  try {
    if (!uid) {
      throw new Error("Vendor UID is required.");
    }

    const vendorDocRef = doc(db, "vendors", uid);

    // Use setDoc with { merge: true } to create or update the document
    await setDoc(vendorDocRef, updates, { merge: true });

    console.log("Vendor data updated successfully.");
  } catch (error) {
    console.error("Error updating vendor data:", error);
    throw error;
  }
};

export const getVendorAccountData = async (uid: string) => {
  try {
    const vendorDocRef = doc(db, "vendors", uid);
    const vendorDoc = await getDoc(vendorDocRef);
    return vendorDoc.exists() ? vendorDoc.data() : null;
  } catch (error) {
    console.error("Error fetching vendor account data:", error);
    throw error;
  }
};


