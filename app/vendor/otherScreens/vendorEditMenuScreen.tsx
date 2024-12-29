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
} from "react-native";
import { useRouter } from "expo-router"; // Import useRouter
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome
import { SafeAreaView } from "react-native-safe-area-context";
import HorizontalLine from "@/components/default/HorizontalLine";
import { saveMenuItem } from "@/services/firestore"; // Import the saveMenuItem function
import { selectUser } from "../../../redux/authSlice"; // Update the path as needed
import { useSelector } from "react-redux";
import { MenuItem } from "@/constants/types"; // Import the MenuItem type
import { fetchMenuItems } from "@/services/firestore"; // Adjust the path as needed
import { useEffect } from "react";

export default function EditMenuItemsScreen() {
  const router = useRouter();
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
      category: newItemCategory,
    };

    try {
      // Save to Firestore
      await saveMenuItem(vendorUid, newItem.category, newItem);

      // Update local state
      setMenuItems((prevItems) => [...prevItems, newItem]);
      closeModal();
      console.log("Menu item added successfully");
    } catch (error) {
      console.error("Error adding menu item:", error);
      Alert.alert("Error", "Could not save the menu item.");
    }
  };

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
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
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
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Add New Menu Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newItemDescription}
              onChangeText={setNewItemDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={newItemCategory}
              onChangeText={setNewItemCategory}
            />

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
          </View>
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
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 8,
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
    color: "blue",
  },
  itemContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
    borderRadius: 8,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 8,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    flex: 1, // Push the text to the center within the row layout
    textAlign: "center", // Center the text horizontally
  },
});
