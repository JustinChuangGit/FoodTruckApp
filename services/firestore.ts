import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteField, arrayRemove,arrayUnion, increment } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app
import { Alert } from "react-native"; // For React Native prompts (adjust for web if needed)
import { MenuItem } from "@/constants/types"; // Import the MenuItem type
import { Timestamp } from "firebase/firestore";
import { Coupon } from "@/constants/types"; // Import the Coupon type
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
  updates: Partial<{ email: string; name: string; isVendor: boolean; acceptedTerms: string }>
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


export const saveTermsAcceptance = async (uid: string): Promise<void> => {
  try {
    await updateUserData(uid, { acceptedTerms: new Date().toISOString() });
    console.log("Terms acceptance saved successfully.");
  } catch (error) {
    console.error("Error saving terms acceptance:", error);
    throw error;
  }
};



export const saveCoupon = async (
  vendorUid: string | undefined,
  coupon: Coupon
): Promise<void> => {
  try {
    if (!vendorUid) {
      throw new Error("Vendor UID is undefined. Please log in again.");
    }

    const couponRef = doc(db, "vendors", vendorUid, "coupons", coupon.id);
    
    await setDoc(couponRef, {
      ...coupon,
    });

    console.log("Coupon saved successfully:", coupon.id);
  } catch (error) {
    console.error("Error saving coupon:", error);
    throw error;
  }
};

export const fetchCoupons = async (vendorUid: string): Promise<Coupon[]> => {
  try {
    const couponsCollectionRef = collection(db, "vendors", vendorUid, "coupons");
    const snapshot = await getDocs(couponsCollectionRef);

    const coupons: Coupon[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Coupon;

      // Explicitly use Firestore document ID as the `id`, overriding if necessary
      return {
        ...data,
        id: doc.id, // Firestore's document ID takes precedence
      };
    });

    return coupons;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};


export const addCouponToAccount = async (
  userId: string,
  couponId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      addedCoupons: arrayUnion(couponId), // Add coupon ID to the array
    });
    console.log(`Coupon ${couponId} added to user ${userId}'s account.`);
  } catch (error) {
    console.error("Error adding coupon to account:", error);
    throw error;
  }
};

export const removeCouponFromAccount = async (
  userId: string,
  couponId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      addedCoupons: arrayRemove(couponId), // Remove coupon ID from the array
    });
    console.log(`Coupon ${couponId} removed from user ${userId}'s account.`);
  } catch (error) {
    console.error("Error removing coupon from account:", error);
    throw error;
  }
};

export const logTransaction = async ({
  userId,
  vendorUid,
  vendorType,
  latitude,
  longitude,
}: {
  userId: string;
  vendorUid: string;
  vendorType?: string;
  latitude?: number;
  longitude?: number;
}): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();

    // Log transaction in the user's collection
    const transactionID = `${vendorUid}_${timestamp}`;
    const transactionData = {
      vendorType,
      latitude,
      longitude,
      date: timestamp,
    };

    await setDoc(
      doc(db, "users", userId, "transactions", transactionID),
      transactionData
    );

    // Log transaction in the vendor's collection
    const vendorTransactionID = `${userId}_${timestamp}`;
    const vendorTransactionData = {
      latitude,
      longitude,
      date: timestamp,
    };

    await setDoc(
      doc(db, "vendors", vendorUid, "transactions", vendorTransactionID),
      vendorTransactionData
    );

    // Update the user's rewardPoints
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      rewardPoints: increment(10), // Increment rewardPoints by 10
    });

    console.log(`Transaction logged for user: ${userId}`);
  } catch (error) {
    console.error("Error logging transaction:", error);
    throw error;
  }
};


export const getMatchingCouponsForVendor = async ({
  userId,
  vendorUid,
}: {
  userId: string;
  vendorUid: string;
}): Promise<string[]> => {
  try {
    // Validate input
    if (!userId || typeof userId !== "string" || !vendorUid || typeof vendorUid !== "string") {
      console.error("Invalid userId or vendorUid provided.");
      return [];
    }

    // Fetch user's added coupons (only the 'addedCoupons' field)
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn(`User with ID ${userId} not found.`);
      return [];
    }

    const userCoupons = userDoc.data()?.addedCoupons || [];
    if (!Array.isArray(userCoupons) || !userCoupons.length) {
      console.log(`No coupons found for user ${userId}.`);
      return [];
    }

    // Fetch vendor's coupons
    const vendorCouponsCollectionRef = collection(db, "vendors", vendorUid, "coupons");
    const vendorCouponsSnapshot = await getDocs(vendorCouponsCollectionRef);

    if (vendorCouponsSnapshot.empty) {
      console.log(`No coupons found for vendor ${vendorUid}.`);
      return [];
    }

    // Create a set of vendor coupon IDs for fast lookups
    const vendorCouponIds = new Set<string>();
    vendorCouponsSnapshot.forEach((doc) => {
      vendorCouponIds.add(doc.id);
    });

    // Find matching coupons
    const matchingCoupons = userCoupons.filter((couponId) => vendorCouponIds.has(couponId));

    return matchingCoupons;
  } catch (error) {
    console.error("Error fetching matching coupons:", error);
    return []; // Return empty array to avoid breaking the flow
  }
};


