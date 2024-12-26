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

// Define the type for a menu item
type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
};

export default function EditMenuItemsScreen() {
  const router = useRouter(); // Use router for navigation

  // State for menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  // Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");

  // Open Modal
  const openModal = () => {
    setModalVisible(true);
    resetForm();
  };

  // Close Modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Reset Form Fields
  const resetForm = () => {
    setNewItemName("");
    setNewItemPrice("");
    setNewItemDescription("");
    setNewItemCategory("");
  };

  // Add New Menu Item
  const addMenuItem = () => {
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
      id: Date.now().toString(), // Unique ID based on timestamp
      name: newItemName,
      price: parseFloat(newItemPrice), // Convert price to number
      description: newItemDescription,
      category: newItemCategory,
    };

    setMenuItems((prevItems) => [...prevItems, newItem]); // Add new item
    closeModal(); // Close the modal
  };

  // Group Menu Items by Category
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

  // Render Category with Items
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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Hello</Text>
      </TouchableOpacity>

      {/* List of Menu Items Grouped by Category */}
      <FlatList
        data={Object.keys(groupedItems)} // Categories as keys
        keyExtractor={(item) => item}
        renderItem={renderCategory}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No menu items added yet.</Text>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add Menu Item</Text>
      </TouchableOpacity>

      {/* Add Menu Item Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Add New Menu Item</Text>

            {/* Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={newItemName}
              onChangeText={setNewItemName}
            />

            {/* Price Input */}
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="numeric"
            />

            {/* Description Input */}
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newItemDescription}
              onChangeText={setNewItemDescription}
            />

            {/* Category Input */}
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={newItemCategory}
              onChangeText={setNewItemCategory}
            />

            {/* Modal Buttons */}
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
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 40,
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
});
