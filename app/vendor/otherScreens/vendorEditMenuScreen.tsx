import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router"; // Import useRouter
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome
import { SafeAreaView } from "react-native-safe-area-context";
import HorizontalLine from "@/components/default/HorizontalLine";
import { saveMenuItem } from "@/services/firestore"; // Import the saveMenuItem function
import { selectUser } from "../../../redux/authSlice"; // Update the path as needed
import { useSelector } from "react-redux";
import { MenuItem } from "@/constants/types"; // Import the MenuItem type
import { fetchMenuItems, deleteMenuItem } from "@/services/firestore"; // Adjust the path as needed
import { useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/services/firestore"; // Adjust to your Firebase configuration

import { useDispatch } from "react-redux";
import { updateMenu } from "../../../redux/authSlice"; // Adjust the path as needed
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";

export default function EditMenuItemsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const vendorUid = user?.uid;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const openModal = () => {
    setModalVisible(true);
    resetForm();
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const resetForm = () => {
    setNewItemName("");
    setNewItemPrice("");
    setNewItemDescription("");
    setNewItemCategory("");
  };

  const addMenuItem = async () => {
    if (
      !newItemName.trim() ||
      !newItemPrice.trim() ||
      !newItemDescription.trim() ||
      !newItemCategory.trim()
    ) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      description: newItemDescription,
      category: newItemCategory, // Keep category as a field, but don't group by it
    };

    try {
      if (!vendorUid) {
        console.error("Vendor UID is missing.");
        return; // Exit early if vendorUid is undefined
      }
      // Save the item directly to the vendor's menu collection
      await saveMenuItem(vendorUid, newItem);

      // Update local state with the new item
      setMenuItems((prevItems) => [...prevItems, newItem]);

      // Dispatch the updateMenu action to update Redux state
      dispatch(updateMenu([...menuItems, newItem]));

      closeModal();
      console.log("Menu item added successfully");
    } catch (error) {
      console.error("Error adding menu item:", error);
      Alert.alert("Error", "Could not save the menu item.");
    }
  };

  const saveMenuItem = async (vendorUid: string, menuItem: MenuItem) => {
    const menuCollectionRef = collection(db, `vendors/${vendorUid}/menu`);
    await addDoc(menuCollectionRef, menuItem);
  };

  const fetchMenuItems = async (vendorUid: string) => {
    const menuCollectionRef = collection(db, `vendors/${vendorUid}/menu`);
    const snapshot = await getDocs(menuCollectionRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
  };
  const deleteMenuItem = async (vendorUid: string, itemId: string) => {
    const itemRef = doc(db, `vendors/${vendorUid}/menu/${itemId}`);
    await deleteDoc(itemRef);
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true); // Set loading at the beginning
      if (!vendorUid) {
        console.error("Vendor UID is missing.");
        setLoading(false);
        return;
      }

      try {
        const items = await fetchMenuItems(vendorUid);
        setMenuItems(items);
      } catch (error) {
        Alert.alert(
          "Error",
          "Could not fetch menu items. Please try again later."
        );
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchItems();
  }, [vendorUid]);

  const renderCategory = ({ item: category }: { item: string }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryHeader}>{category}</Text>
      <FlatList
        data={groupedItems[category]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.itemDeleteButton}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    if (!vendorUid) {
                      console.error("Vendor UID is missing.");
                      return; // Exit early if vendorUid is undefined
                    }
                    await deleteMenuItem(vendorUid, item.id); // No need for category reference
                    const updatedItems = await fetchMenuItems(vendorUid);
                    setMenuItems(updatedItems);
                  } catch (error) {
                    console.error("Error deleting menu item:", error);
                    Alert.alert("Error", "Could not delete the menu item.");
                  }
                }}
              >
                <FontAwesome name="trash" size={30} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Items</Text>
      </View>

      <HorizontalLine />

      {loading ? (
        <Text style={styles.emptyText}>Loading menu items...</Text>
      ) : (
        <FlatList
          data={Object.keys(groupedItems)}
          keyExtractor={(item) => item}
          renderItem={renderCategory}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items added yet.</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust based on platform
            keyboardVerticalOffset={20} // Tweak for your layout
          >
            <Text style={styles.modalHeader}>Add New Menu Item</Text>

            {/* Content that doesn't need scrolling */}
            <Text style={styles.modalSubHeader}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={newItemName}
              onChangeText={setNewItemName}
              placeholderTextColor={"#bbb"}
            />

            <Text style={styles.modalSubHeader}>Price</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                justifyContent: "center",
              }}
            >
              <FontAwesome
                name="dollar"
                size={24}
                color="black"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]} // Flex 1 to fill remaining space
                placeholder="Price"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                keyboardType="numeric"
                placeholderTextColor={"#bbb"}
              />
            </View>

            <Text style={styles.modalSubHeader}>Description</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Description"
              value={newItemDescription}
              onChangeText={setNewItemDescription}
              multiline={true}
              placeholderTextColor={"#bbb"}
            />

            <Text style={styles.modalSubHeader}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={newItemCategory}
              onChangeText={setNewItemCategory}
              placeholderTextColor={"#bbb"}
            />

            {/* Footer */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={addMenuItem}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 10, // Space between back button and title
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: munchColors.primary,
    padding: 16,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: munchColors.primary,
  },
  itemContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDescription: {
    fontSize: 14,
    color: "#555",
  },
  itemPrice: {
    fontSize: 14,
    color: "green",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: munchStyles.smallRadius,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: munchStyles.smallRadius,
    padding: 8,
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: munchColors.primary,
    padding: 12,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "gray",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60, // Fixed height
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 4,
    fontWeight: "bold",
    color: "#000",
    flex: 1, // Push the text to the center within the row layout
    textAlign: "center", // Center the text horizontally
  },
  itemTextContainer: {
    flex: 1,
  },
  itemDeleteButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
