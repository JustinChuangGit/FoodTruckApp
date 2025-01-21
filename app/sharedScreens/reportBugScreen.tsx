import React, { isValidElement, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import emailjs from "emailjs-com"; // Import EmailJS
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch
import { selectUser } from "@/redux/authSlice"; // Update the path as needed

export default function ReportBugScreen(): JSX.Element {
  // Define state with appropriate types
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const name = user?.name;
  const email = user?.email;
  const uid = user?.uid;
  const isvendor = user?.isVendor;
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize EmailJS
  emailjs.init("hQlTc-DR44Rw5ebKP"); // Replace with your EmailJS public key

  const handleSubmit = async (): Promise<void> => {
    if (!description) {
      Alert.alert("Error", "Please describe the bug.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use EmailJS to send the email
      const response = await emailjs.send(
        "service_dqjygmb", // Replace with your EmailJS service ID
        "template_n4ob3wm", // Replace with your EmailJS template ID
        {
          description,
          email,
          name,
          uid,
          isvendor,
        }
      );

      if (response.status === 200) {
        Alert.alert("Thank You", "Your bug report has been submitted!");
        setDescription("");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Error", error.text || "An unexpected error occurred.");
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
