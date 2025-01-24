import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { FontAwesome } from "@expo/vector-icons";
import { selectUser } from "@/redux/authSlice"; // Update the path as needed
import { useSelector } from "react-redux";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, saveCoupon } from "@/services/firestore"; // Update the path as needed
import { Coupon } from "@/constants/types"; // Update the path as needed

const CouponManager: React.FC = () => {
  const user = useSelector(selectUser);
  const vendorUid = user?.uid || null; // Ensure vendorUid is `null` if user is logged out

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

      // Generate a timestamp
      const timestamp = Date.now(); // Current time in milliseconds

      // Add createdAt to the coupon object
      const couponWithTimestamp = { ...newCoupon, createdAt: timestamp };

      // Save the coupon to Firestore
      await saveCoupon(vendorUid, couponWithTimestamp);

      // Add the coupon locally for immediate UI feedback
      setCoupons((prev) => [...prev, couponWithTimestamp]);

      // Reset form and close modal
      setNewCoupon({
        id: "", // Reset or assign a temporary value for the ID
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

      const couponRef = doc(db, "vendors", vendorUid, "coupons", coupon.id);
      await deleteDoc(couponRef);

      console.log("Coupon deleted:", coupon.id);

      // Update local state
      setCoupons((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete coupon:", error);
    }
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
                Uses: {item.uses} | Valid Until: {item.validUntil}
              </Text>
              <Text style={styles.couponValue}>Value: {item.value}</Text>
              <TouchableOpacity
                style={styles.deleteIcon}
                onPress={() => handleDeleteCoupon(index - 1)}
              >
                <FontAwesome name="trash" size={24} color="red" />
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
        onRequestClose={() => setCouponModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Coupon</Text>
            <TextInput
              style={styles.input}
              placeholder="Headline"
              value={newCoupon.headline}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, headline: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newCoupon.description}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, description: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Number of Uses"
              keyboardType="numeric"
              value={newCoupon.uses}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, uses: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Valid Until"
              value={newCoupon.validUntil}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, validUntil: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Coupon Value"
              value={newCoupon.value}
              onChangeText={(text) =>
                setNewCoupon((prev) => ({ ...prev, value: text }))
              }
            />
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
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
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
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});

export default CouponManager;
