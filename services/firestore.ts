import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteField, arrayRemove,arrayUnion, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app
import { Alert } from "react-native"; // For React Native prompts (adjust for web if needed)
import { MenuItem } from "@/constants/types"; // Import the MenuItem type
import { Timestamp } from "firebase/firestore";
import { Coupon, Event } from "@/constants/types"; // Import the Coupon type
// Initialize Firestore
export const db = getFirestore(app);
import { v4 as uuidv4 } from "uuid"; // Generate a unique ID

// Function to save user data
export const saveUserData = async (
  uid: string,
  data: { email: string; name: string; isVendor: boolean, phone: string, mailingAddress?: string, accountCreated?: string, referralCode?: string, latitude?: number, longitude?: number, rewardPoints?: number, coupons?: Coupon[], addedCoupons?: string[], moneySavedFromCoupons?: number, vendorName?: string, vendorPaid?: boolean, image?: string, truckImage?: string, price?: string, vendorType?: string, description?: string }
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

  try {
    if (data.referralCode) {
        await setDoc(doc(db, "referralCodes", data.referralCode), {
            uid: uid, // Store the user's UID for reference
            isVendor: data.isVendor,
        });
        console.log("Referral code saved successfully.");
    }
} catch (error) {
    console.error("Error saving referral code:", error);
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
  updates: Partial<{
    email: string;
    name: string;
    acceptedTerms: string;
  }>
): Promise<void> => {
  try {
    // Check the 'users' collection first
    const userDocRef = doc(db, "users", uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // Document exists in the 'users' collection
      await updateDoc(userDocRef, updates);
      console.log("User data updated successfully");
      return;
    }

    // If not in 'users', check the 'vendors' collection
    const vendorDocRef = doc(db, "vendors", uid);
    const vendorDocSnapshot = await getDoc(vendorDocRef);

    if (vendorDocSnapshot.exists()) {
      // Document exists in the 'vendors' collection
      await updateDoc(vendorDocRef, updates);
      console.log("Vendor data updated successfully");
      return;
    }

    // If neither exists, throw an error
    throw new Error(`Document with uid ${uid} not found in 'users' or 'vendors' collections.`);
  } catch (error) {
    console.error("Error updating data:", error);
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

export const removeCouponsFromAccount = async (
  userId: string,
  coupons: Coupon[]
): Promise<void> => {
  try {
    if (!userId || coupons.length === 0) {
      console.warn("No userId or coupons provided.");
      return;
    }

    const userDocRef = doc(db, "users", userId);

    // Use a batch operation to remove all coupon IDs from the user's account
    const couponIds = coupons.map((coupon) => coupon.id); // Extract IDs from the Coupon array

    await updateDoc(userDocRef, {
      addedCoupons: arrayRemove(...couponIds), // Use spread to remove multiple IDs
    });

    console.log(
      `Coupons ${couponIds.join(", ")} removed from user ${userId}'s account.`
    );
  } catch (error) {
    console.error("Error removing coupons from account:", error);
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
}): Promise<Coupon[]> => {
  try {
    // Validate input
    if (!userId || !vendorUid) {
      console.error("Invalid userId or vendorUid provided.");
      return [];
    }

    // Fetch user's added coupons
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn(`User with ID ${userId} not found.`);
      return [];
    }

    const userCoupons = userDoc.data()?.addedCoupons || [];
    if (!Array.isArray(userCoupons) || userCoupons.length === 0) {
      console.log(`No coupons found for user ${userId}.`);
      return [];
    }

    // Fetch vendor's coupons
    const vendorCouponsCollectionRef = collection(
      db,
      "vendors",
      vendorUid,
      "coupons"
    );
    const vendorCouponsSnapshot = await getDocs(vendorCouponsCollectionRef);

    if (vendorCouponsSnapshot.empty) {
      console.log(`No coupons found for vendor ${vendorUid}.`);
      return [];
    }

    // Map vendor coupon documents to their full details
    const vendorCouponsMap = new Map<string, Coupon>();
    vendorCouponsSnapshot.forEach((doc) => {
      const couponData = doc.data();
      if (
        couponData.headline &&
        couponData.description &&
        couponData.uses &&
        couponData.validUntil &&
        couponData.value
      ) {
        vendorCouponsMap.set(doc.id, { id: doc.id, ...couponData } as Coupon);
      } else {
        console.warn(`Coupon with ID ${doc.id} has missing fields.`);
      }
    });

    // Match user's coupons with vendor's coupons
    const matchingCoupons = userCoupons
      .filter((couponId: string) => vendorCouponsMap.has(couponId))
      .map((couponId: string) => vendorCouponsMap.get(couponId));

    // Filter out undefined results
    return matchingCoupons.filter((coupon): coupon is Coupon => coupon !== undefined);
  } catch (error) {
    console.error("Error fetching matching coupons:", error);
    return [];
  }
};


export const addToCouponSavings = async (
  userId: string,
  couponValue: number
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);

    // Increment the couponSavings field by the couponValue
    await updateDoc(userDocRef, {
      couponSavings: increment(couponValue),
    });

    console.log(
      `Coupon value of $${couponValue} added to user ${userId}'s couponSavings.`
    );
  } catch (error) {
    console.error("Error adding to coupon savings:", error);
    throw error;
  }
};

export const decrementCouponUses = async (
  vendorUid: string,
  coupons: Coupon[],
  latitude: number,
  longitude: number,
  customerUid: string
): Promise<void> => {
  try {
    const totalCouponUsesRef = doc(db, "vendors", vendorUid);

    await Promise.all([
      // Update each coupon's uses
      ...coupons.map(async (coupon) => {
        const currentUses = coupon.uses ?? 0; // Default to 0 if `uses` is null
        const couponRef = doc(db, "vendors", vendorUid, "coupons", coupon.id);
        await updateDoc(couponRef, {
          uses: Math.max(currentUses - 1, 0), // Decrement uses
        });
      }),

      // Add to the totalCouponUses array
      updateDoc(totalCouponUsesRef, {
        totalCouponUses: arrayUnion(
          ...coupons.map((coupon) => ({
            couponId: coupon.id,
            timestamp: Date.now(),
            latitude: latitude,
            longitude: longitude,
            customer: customerUid, // Add customer UID
          }))
        ),
      }),
    ]);

    console.log("Updated coupons and added to totalCouponUses:", coupons.map((c) => c.id));
  } catch (error) {
    console.error("Error updating coupons or adding to totalCouponUses:", error);
    throw error;
  }
};



export const updateMoneySaved = async (
  userId: string,
  coupons: Coupon[]
): Promise<void> => {
  try {
    if (!userId || coupons.length === 0) {
      console.warn("No userId or coupons provided.");
      return;
    }

    // Calculate the total value of the redeemed coupons
    const totalSavings = coupons.reduce((sum, coupon) => {
      return sum + (coupon.value ?? 0); // Add coupon value, defaulting to 0 if null
    }, 0);

    const userDocRef = doc(db, "users", userId);

    // Increment the moneySaved field by the totalSavings value
    await updateDoc(userDocRef, {
      moneySaved: increment(totalSavings),
    });

    console.log(`Updated moneySaved for user ${userId} by $${totalSavings}.`);
  } catch (error) {
    console.error("Error updating moneySaved field:", error);
    throw error;
  }
};

export async function logImpression(
  vendorUid: string,
  accountUid: string,
  latitude: number,
  longitude: number,
  type: string
) {
  if (!vendorUid || !accountUid || latitude === undefined || longitude === undefined || !type) {
    console.error("Missing required parameters for logClickThrough");
    return;
  }

  try {
    // Reference to the vendor document
    const vendorRef = doc(db, `vendors/${vendorUid}`);

    // Get current timestamp from the client
    const timestamp = new Date().toISOString(); // ISO format for consistency

    // Click data to append to the array
    const clickData = {
      timestamp, // Use client-side timestamp
      account: accountUid,
      latitude: latitude,
      longitude: longitude,
      type: type,
    };

    // Update Firestore document to add to the array
    await updateDoc(vendorRef, {
      accountImpression: arrayUnion(clickData), // Append to the array
    });

  } catch (error) {
    console.error("Error logging click-through:", error);
  }
}

export async function logClickThrough(
  vendorUid: string,
  accountUid: string,
  latitude: number,
  longitude: number,
  type: string
) {
  if (!vendorUid || !accountUid || latitude === undefined || longitude === undefined || !type) {
    console.error("Missing required parameters for logClickThrough");
    return;
  }

  try {
    // Reference to the vendor document
    const vendorRef = doc(db, `vendors/${vendorUid}`);

    // Get current timestamp from the client
    const timestamp = new Date().toISOString(); // ISO format for consistency

    // Click data to append to the array
    const clickData = {
      timestamp, // Use client-side timestamp
      account: accountUid,
      latitude: latitude,
      longitude: longitude,
      type: type,
    };

    // Update Firestore document to add to the array
    await updateDoc(vendorRef, {
      accountClicks: arrayUnion(clickData), // Append to the array
    });

  } catch (error) {
    console.error("Error logging click-through:", error);
  }
}
export async function logCouponAdd(
  vendorUid: string,
  accountUid: string,
  latitude: number,
  longitude: number,
  couponId: string
) {
  if (!vendorUid || !accountUid || latitude === undefined || longitude === undefined || !couponId) {
    console.error("Missing required parameters for logClickThrough");
    return;
  }

  try {
    // Reference to the vendor document
    const vendorRef = doc(db, `vendors/${vendorUid}`);

    // Get current timestamp from the client
    const timestamp = new Date().toISOString(); // ISO format for consistency

    // Click data to append to the array
    const clickData = {
      timestamp, // Use client-side timestamp
      account: accountUid,
      latitude: latitude,
      longitude: longitude,
      couponId: couponId,
    };

    // Update Firestore document to add to the array
    await updateDoc(vendorRef, {
      couponAdds: arrayUnion(clickData), // Append to the array
    });

  } catch (error) {
    console.error("Error logging click-through:", error);
  }
}


export async function checkReferralCode(referralCode: string): Promise<boolean> {
  try {
    // Reference the Firestore document where referral codes are stored
    const referralDocRef = doc(db, "referralCodes", referralCode);
    const referralDocSnap = await getDoc(referralDocRef);

    // If document exists, the referral code exists in Firestore
    if (referralDocSnap.exists()) {
      addRewardPoints(referralDocSnap.data().uid);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking referral code:", error);
    return false; // Assume it doesn't exist if there's an error
  }
}


export async function addRewardPoints(uid: string): Promise<void> {
  if (!uid) {
    return;
  }

  try {
    // Reference the Firestore document for the user
    const userDocRef = doc(db, "users", uid);

    // Increment rewardPoints by 50
    await updateDoc(userDocRef, {
      rewardPoints: increment(50),
    });

  } catch (error) {
    throw error;
  }
}


export const saveEvent = async (event: Event): Promise<string> => {
  try {
    const eventId = uuidv4(); // Generate a unique event ID
    const eventRef = doc(db, "events", eventId); // Create a Firestore doc reference

    const eventData = {
      ...event,
      eventId, // Store event ID inside the document
      date: event.date.toISOString(),
      startTime: event.startTime ? event.startTime.toISOString() : null,
      endTime: event.endTime ? event.endTime.toISOString() : null,
      createdAt: serverTimestamp(),
    };

    await setDoc(eventRef, eventData); // Save data with custom ID
    console.log("Event saved successfully with ID:", eventId);

    return eventId;
  } catch (error) {
    console.error("Error saving event:", error);
    throw error;
  }
};


export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, "events"); // Reference to Firestore "events" collection
    const querySnapshot = await getDocs(eventsRef);

    const events: Event[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        eventTitle: data.eventTitle,
        date: new Date(data.date),
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null,
        locationText: data.locationText,
        description: data.description || "",
        region: {
          latitude: data.region.latitude,
          longitude: data.region.longitude,
          latitudeDelta: data.region.latitudeDelta ?? 0.01,
          longitudeDelta: data.region.longitudeDelta ?? 0.01,
        },
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore timestamp
      };
    });

    console.log("Fetched Events:", events);
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};