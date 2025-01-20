import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import emailjs from "emailjs-com";

export default function ReportBugScreen() {
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert("Error", "Please describe the bug.");
      return;
    }

    setIsSubmitting(true);

    const templateParams = {
      description,
      email,
    };

    try {
      await emailjs.send(
        "your_service_id", // Replace with your EmailJS service ID
        "your_template_id", // Replace with your EmailJS template ID
        templateParams,
        "your_public_key" // Replace with your EmailJS public key
      );
      Alert.alert("Thank You", "Your bug report has been submitted!");
      setDescription("");
      setEmail("");
    } catch (error) {
      console.error("Bug report failed:", error);
      Alert.alert("Error", "Failed to send bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report a Bug</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe the bug you encountered..."
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Your email (optional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Submitting..." : "Submit Bug Report"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
