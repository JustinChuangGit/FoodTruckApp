import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

interface Vendor {
  uid: string;
  name: string;
  description: string;
  image: string;
  rating: number;
}

type VendorDetailRouteProps = RouteProp<
  { VendorDetail: { vendor: Vendor } },
  "VendorDetail"
>;

const VendorDetailPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<VendorDetailRouteProps>();

  const vendor = route.params?.vendor;

  if (!vendor) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No vendor data available.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{"< Back"}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Dummy menu data
  const dummyMenu = [
    {
      id: "1",
      name: "Taco Special",
      price: "$8.99",
      description: "Three tacos with a choice of filling.",
    },
    {
      id: "2",
      name: "Burrito Deluxe",
      price: "$9.99",
      description: "Stuffed burrito with rice, beans, and meat.",
    },
    {
      id: "3",
      name: "Quesadilla Combo",
      price: "$7.99",
      description: "Cheese quesadilla served with salsa and guacamole.",
    },
  ];

  const renderMenuItem = ({ item }: { item: (typeof dummyMenu)[0] }) => (
    <View style={styles.menuItem}>
      <Text style={styles.menuItemName}>{item.name}</Text>
      <Text style={styles.menuItemPrice}>{item.price}</Text>
      <Text style={styles.menuItemDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>{"< Back"}</Text>
      </TouchableOpacity>

      <Image source={{ uri: vendor.image }} style={styles.logo} />
      <Text style={styles.name}>{vendor.name}</Text>
      <Text style={styles.description}>{vendor.description}</Text>
      <Text style={styles.rating}>Rating: {vendor.rating}/5</Text>

      <Text style={styles.menuHeader}>Menu</Text>
      <FlatList
        data={dummyMenu}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.menuList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: "#007bff",
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  menuHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  menuList: {
    paddingBottom: 16,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    color: "#007bff",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#555",
  },
});

export default VendorDetailPage;
