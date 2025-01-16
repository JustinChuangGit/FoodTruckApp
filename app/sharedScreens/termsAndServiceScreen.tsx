import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function TermsAndServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome
            name="chevron-left"
            size={30}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Terms of Service</Text>
      </View>

      {/* Terms Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Welcome to Our Application</Text>
        <Text style={styles.text}>
          By accessing or using our application, you agree to comply with and be
          bound by these Terms of Service. If you do not agree to these terms,
          please do not use our app.
        </Text>

        <Text style={styles.sectionTitle}>User Responsibilities</Text>
        <Text style={styles.text}>
          As a user of this application, you agree to:
        </Text>
        <Text style={styles.bullet}>
          • Provide accurate and up-to-date information.
        </Text>
        <Text style={styles.bullet}>
          • Respect other users and refrain from abusive behavior.
        </Text>
        <Text style={styles.bullet}>
          • Use the app in compliance with all applicable laws and regulations.
        </Text>

        <Text style={styles.sectionTitle}>Limitation of Liability</Text>
        <Text style={styles.text}>
          We are not responsible for any damages or losses resulting from your
          use of this application. Use the app at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>Changes to Terms</Text>
        <Text style={styles.text}>
          We reserve the right to update these Terms of Service at any time.
          Please review them periodically to stay informed.
        </Text>
      </ScrollView>

      {/* Acknowledge Button */}
      <TouchableOpacity
        style={styles.acknowledgeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.acknowledgeButtonText}>I Acknowledge</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingHorizontal: 10,
  },
  backButton: {
    fontSize: 18,
    color: "#000",
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  text: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  bullet: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginLeft: 10,
  },
  acknowledgeButton: {
    backgroundColor: "#007aff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
  },
  acknowledgeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
