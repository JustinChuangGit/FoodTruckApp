import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { FontAwesome } from "@expo/vector-icons";
import { selectUser, deleteCoupon, addCoupon } from "@/redux/authSlice"; // Update the path as needed
import { useSelector, useDispatch } from "react-redux";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, saveCoupon } from "@/services/firestore"; // Update the path as needed
import { Coupon } from "@/constants/types"; // Update the path as needed
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import HorizontalLine from "./default/HorizontalLine";

const CouponManager: React.FC = () => {
  const user = useSelector(selectUser);
  const vendorUid = user?.uid || null; // Ensure vendorUid is `null` if user is logged out
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isCouponModalVisible, setCouponModalVisible] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    id: "", // Placeholder for the ID
    headline: "",
    description: "",
    uses: "",
    validUntil: "",
    value: "",
  });

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!vendorUid) {
        return; // Exit the function if vendorUid is undefined
      }

      try {
        const couponsCollectionRef = collection(
          db,
          `vendors/${vendorUid}/coupons`
        );
        const snapshot = await getDocs(couponsCollectionRef);

        const fetchedCoupons: Coupon[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Coupon, "id">; // Exclude the `id` from Firestore data
          return {
            ...data,
            id: doc.id, // Explicitly use Firestore's document ID
          };
        });

        setCoupons(fetchedCoupons);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      }
    };

    fetchCoupons();
  }, [vendorUid]);

  const handleAddCoupon = async () => {
    try {
      if (!vendorUid) {
        console.error("Vendor UID is undefined. Cannot save coupon.");
        return;
      }

      // Generate a unique ID and timestamp for the coupon
      const couponId = `${vendorUid}_${Date.now()}`;
      const couponWithTimestamp = {
        ...newCoupon,
        id: couponId,
        createdOn: Date.now(), // Add timestamp
      };

      // Save the coupon to `vendors/{vendorUid}/coupons`
      await saveCoupon(vendorUid, couponWithTimestamp);

      // If the vendor is active, add the coupon to the `coupons` array in `activeVendors`
      const activeVendorDoc = doc(db, `activeVendors/${vendorUid}`);
      const activeVendorSnapshot = await getDoc(activeVendorDoc);

      if (activeVendorSnapshot.exists()) {
        // Use Firestore's `arrayUnion` to add the coupon to the existing array
        await updateDoc(activeVendorDoc, {
          coupons: arrayUnion(couponWithTimestamp),
        });
        console.log("Coupon added to active vendor.");
      }

      // Add the coupon locally for immediate UI feedback
      setCoupons((prev) => [...prev, couponWithTimestamp]);

      dispatch(addCoupon(couponWithTimestamp)); // Dispatch Redux action to add coupon

      // Reset form and close modal
      setNewCoupon({
        id: "",
        headline: "",
        description: "",
        uses: "",
        validUntil: "",
        value: "",
      });

      setCouponModalVisible(false);
    } catch (error) {
      console.error("Failed to add coupon:", error);
    }
  };

  const handleDeleteCoupon = async (index: number) => {
    try {
      if (!vendorUid) {
        console.error("Vendor UID is undefined. Cannot delete coupon.");
        return;
      }

      const coupon = coupons[index];

      if (!coupon.id) {
        console.error("Coupon does not have an ID. Cannot delete.");
        return;
      }

      // Delete coupon from `vendors/{vendorUid}/coupons/{couponId}`
      const couponRef = doc(db, `vendors/${vendorUid}/coupons`, coupon.id);
      await deleteDoc(couponRef);
      console.log(
        "Coupon deleted from vendor's coupons collection:",
        coupon.id
      );

      // If vendor is active, remove the coupon from `activeVendors/{vendorUid}`
      const activeVendorDoc = doc(db, `activeVendors/${vendorUid}`);
      const activeVendorSnapshot = await getDoc(activeVendorDoc);

      if (activeVendorSnapshot.exists()) {
        // Use Firestore's `arrayRemove` to remove the coupon from the array
        await updateDoc(activeVendorDoc, {
          coupons: arrayRemove(coupon),
        });
        console.log(
          "Coupon removed from active vendor's coupons array:",
          coupon.id
        );
      }

      // Update local state
      setCoupons((prev) => prev.filter((_, i) => i !== index));

      // Dispatch Redux action to update coupons in the Redux state
      dispatch(deleteCoupon(coupon.id));
    } catch (error) {
      console.error("Failed to delete coupon:", error);
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false); // Hide the picker

    // Format the date as needed (e.g., "YYYY-MM-DD HH:mm")
    const formattedDate = currentDate.toISOString(); // Use a custom format if preferred
    setNewCoupon((prev) => ({ ...prev, validUntil: formattedDate }));
  };

  const closeModal = () => {
    console.log("Closing modal...");
    setCouponModalVisible(false);
    setShowDatePicker(false);

    setNewCoupon({
      id: "", // Reset the ID or keep it as a placeholder
      headline: "",
      description: "",
      uses: "",
      validUntil: "", // Clear the date field
      value: "",
    });
  };

  return (
    <View>
      <Text style={styles.sectionHeader}>Active Coupons</Text>
      <BottomSheetFlatList
        horizontal
        data={[{ isAddButton: true } as any, ...coupons]}
        keyExtractor={(item, index) =>
          "isAddButton" in item ? `addButton-${index}` : item.id
        }
        renderItem={({ item, index }) =>
          "isAddButton" in item ? (
            <TouchableOpacity
              style={styles.addCouponCard}
              onPress={() => setCouponModalVisible(true)}
            >
              <Text style={styles.addCouponText}>+ Add Coupon</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.couponCard}>
              <Text style={styles.couponHeadline}>{item.headline}</Text>
              <Text style={styles.couponDescription}>{item.description}</Text>
              <Text style={styles.couponDetails}>
                Remaining Uses: {item.uses}
              </Text>
              <Text style={styles.couponDetails}>
                Valid Until: {item.validUntil}
              </Text>
              <Text style={styles.couponValue}>Value: {item.value}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCoupon(index - 1)}
              >
                <Text style={{ color: "#fff" }}>Delete </Text>
              </TouchableOpacity>
            </View>
          )
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      />

      {/* Add Coupon Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={isCouponModalVisible}
        onRequestClose={() => closeModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.closeModalButton}
              onPress={() => closeModal()}
            >
              <FontAwesome name="times" size={24} color="black" />
            </Pressable>

            <Text style={styles.modalTitle}>Add Coupon</Text>
            <HorizontalLine />
            <Text style={styles.addCouponHeader}>Headline</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Free Drink"
              value={newCoupon.headline}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, headline: text }))
              }
            />
            <Text style={styles.addCouponHeader}>Description</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Ex: Get a free drink with the purchase of a burger..."
              multiline={true}
              value={newCoupon.description}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, description: text }))
              }
            />
            <Text style={styles.addCouponHeader}>Number of Uses</Text>
            <TextInput
              style={styles.input}
              placeholder="How many times this coupon be used"
              keyboardType="numeric"
              value={newCoupon.uses}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, uses: text }))
              }
            />
            <Text style={styles.addCouponHeader}>Valid Until</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center" }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: "#A9A9A9" }}>
                {newCoupon.validUntil
                  ? new Date(newCoupon.validUntil).toLocaleString()
                  : "Expiry Date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.datePicker}>
                <DateTimePicker
                  value={
                    newCoupon.validUntil
                      ? new Date(newCoupon.validUntil)
                      : new Date()
                  }
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  style={styles.datePicker}
                />
              </View>
            )}
            <Text style={styles.addCouponHeader}>Coupon Value</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="dollar"
                size={24}
                color="black"
                style={styles.dollarSign}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]} // Add flex: 1 to stretch the input
                placeholder="Ex: $2.50"
                keyboardType="decimal-pad"
                value={newCoupon.value}
                onChangeText={(text) =>
                  setNewCoupon((prev) => ({ ...prev, value: text }))
                }
              />
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddCoupon}
            >
              <Text style={styles.modalButtonText}>Save Coupon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  addCouponCard: {
    width: 120,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addCouponText: {
    fontSize: 16,
    color: "#007bff",
    textAlign: "center",
    fontWeight: "bold",
  },
  couponCard: {
    width: 150,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  couponHeadline: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  couponDetails: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  couponValue: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: munchStyles.smallRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: munchStyles.smallRadius,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalButton: {
    backgroundColor: munchColors.primary,
    paddingVertical: 12,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
    borderRadius: munchStyles.smallRadius,
    marginTop: 8,
  },
  closeModalButton: {
    position: "absolute",
    top: 20, // Adjust for proper placement
    right: 15, // Adjust for proper placement
    justifyContent: "center",
    alignItems: "center",
    height: 40, // Increase size for touchable area
    width: 40, // Increase size for touchable area
    borderRadius: 20, // Optional: Circular button
  },

  addCouponHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dollarSign: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignSelf: "center",
  },
  datePicker: {
    height: 50,
  },
});

export default CouponManager;
