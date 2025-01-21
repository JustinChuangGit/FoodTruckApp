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
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import HorizontalLine from "@/components/default/HorizontalLine";
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";
import { info } from "console";

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
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Report A Bug</Text>
        </View>
        <HorizontalLine />

        <View style={styles.infoContainer}>
          <Text style={styles.subheader}>
            Did you run into a problem? Let us know and we will work to fix it
            as soon as possible:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Describe the bug you encountered in as much detail as possible..."
            placeholderTextColor={"grey"}
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 20,
    textAlignVertical: "top",
    height: 150, // Adjust height as needed
    marginTop: 10,
  },
  button: {
    backgroundColor: munchColors.primary,
    paddingVertical: 15,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60, // Fixed height
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    flex: 1, // Push the text to the center within the row layout
    marginLeft: 10, // Space between back button and title
  },
  backButton: {
    marginRight: 10, // Space between back button and title
  },

  subheader: {
    fontSize: 16,
    marginBottom: 10,
  },
});
