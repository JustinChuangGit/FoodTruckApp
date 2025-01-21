import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";
import { selectUser } from "@/redux/authSlice"; // Update the path as needed
import { useSelector } from "react-redux";
import { updateUserData } from "@/services/firestore";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice"; // Import the setUser action
export default function TermsAndServiceScreen() {
  const router = useRouter();
  const user = useSelector(selectUser);
  const dispatch = useDispatch(); // Initialize Redux dispatch here

  const handleAcknowledge = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User is not logged in.");
      return;
    }

    try {
      const acceptedTermsDate = new Date().toISOString();

      // Update the acceptedTerms field in Firestore
      await updateUserData(user.uid, { acceptedTerms: acceptedTermsDate });

      // Update Redux state
      dispatch(
        setUser({
          ...user,
          acceptedTerms: acceptedTermsDate,
        })
      );

      Alert.alert("Success", "You have accepted the terms and conditions.");
      router.back(); // Navigate back after acknowledgment
    } catch (error) {
      console.error("Error updating terms acceptance:", error);
      Alert.alert("Error", "Failed to save your acceptance. Please try again.");
    }
  };

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

        <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing or using Munch ("App"), you agree to be bound by these
          Terms, our Privacy Policy, and any additional terms and conditions
          provided in the App. These Terms apply to all users, including
          vendors, customers, and visitors.
        </Text>

        <Text style={styles.sectionTitle}>Changes to Terms</Text>
        <Text style={styles.text}>
          We reserve the right to update or modify these Terms at any time.
          Changes will become effective immediately upon posting. Your continued
          use of the App constitutes acceptance of the updated Terms. We
          encourage you to review these Terms periodically.
        </Text>

        <Text style={styles.sectionTitle}>Eligibility</Text>
        <Text style={styles.text}>To use the App, you must:</Text>
        <Text style={styles.text}>
          • Be at least 18 years old or have parental consent to use the App.
        </Text>
        <Text style={styles.text}>
          • Have the authority to enter into these Terms if acting on behalf of
          a business or other entity.
        </Text>
        <Text style={styles.text}>
          • Provide accurate and complete registration information.
        </Text>

        <Text style={styles.sectionTitle}>User Accounts</Text>
        <Text style={styles.text}>Account Registration</Text>
        <Text style={styles.text}>
          To access certain features of the App, you may need to create an
          account. You agree to:
        </Text>
        <Text style={styles.text}>
          • Provide accurate, current, and complete information.
        </Text>
        <Text style={styles.text}>• Keep your login credentials secure.</Text>
        <Text style={styles.text}>
          • Notify us immediately of unauthorized access to your account.
        </Text>

        <Text style={styles.sectionTitle}>Prohibited Activities</Text>
        <Text style={styles.text}>You agree not to:</Text>
        <Text style={styles.text}>• Use the App for unlawful purposes.</Text>
        <Text style={styles.text}>
          • Distribute malicious software or engage in hacking.
        </Text>
        <Text style={styles.text}>• Violate intellectual property rights.</Text>
        <Text style={styles.text}>
          • Impersonate others or provide false information.
        </Text>
        <Text style={styles.text}>
          • Interfere with the operation or security of the App.
        </Text>

        <Text style={styles.sectionTitle}>Fees and Payments</Text>
        <Text style={styles.text}>Pricing</Text>
        <Text style={styles.text}>
          Some features of the App may require payment. Pricing and payment
          terms will be disclosed at the point of purchase.
        </Text>
        <Text style={styles.text}>Refunds</Text>
        <Text style={styles.text}>
          Refund requests will be handled on a case-by-case basis. Please
          contact [Support Email] for assistance.
        </Text>

        <Text style={styles.sectionTitle}>Intellectual Property</Text>
        <Text style={styles.text}>
          All content, features, and functionality in the App (e.g., text,
          graphics, logos, and code) are owned by Munch or its licensors and are
          protected by copyright, trademark, and other intellectual property
          laws. You may not reproduce, distribute, or create derivative works
          from this content without our express written permission.
        </Text>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.text}>
          Your use of the App is subject to our Privacy Policy, which explains
          how we collect, use, and protect your information. By using the App,
          you consent to the practices described in the Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>Third-Party Links</Text>
        <Text style={styles.text}>
          The App may include links to third-party websites or services. We do
          not control or endorse these third-party resources and are not
          responsible for their content or practices.
        </Text>

        <Text style={styles.sectionTitle}>Disclaimers</Text>
        <Text style={styles.text}>
          The App is provided "as is" and "as available." To the fullest extent
          permitted by law, we disclaim all warranties, express or implied,
          including but not limited to merchantability, fitness for a particular
          purpose, and non-infringement. We do not guarantee that the App will
          be error-free, secure, or uninterrupted.
        </Text>

        <Text style={styles.sectionTitle}>Limitation of Liability</Text>
        <Text style={styles.text}>
          To the maximum extent permitted by law, Munch shall not be liable for
          any indirect, incidental, consequential, or punitive damages arising
          out of your use of the App. Our total liability shall not exceed the
          amount you paid us in the 12 months preceding the claim.
        </Text>

        <Text style={styles.sectionTitle}>Indemnification</Text>
        <Text style={styles.text}>
          You agree to indemnify, defend, and hold harmless Munch, its
          affiliates, officers, employees, and agents from any claims,
          liabilities, damages, and expenses (including attorney’s fees) arising
          out of your use of the App or violation of these Terms.
        </Text>

        <Text style={styles.sectionTitle}>Termination</Text>
        <Text style={styles.text}>
          We reserve the right to suspend or terminate your access to the App at
          our sole discretion, without notice, for conduct that we believe
          violates these Terms or is harmful to other users or our business
          interests.
        </Text>

        <Text style={styles.sectionTitle}>Governing Law</Text>
        <Text style={styles.text}>
          These Terms are governed by and construed in accordance with the laws
          of California/USA, without regard to conflict of law principles.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions or concerns about these Terms, please
          contact us.
        </Text>
      </ScrollView>

      {/* Acknowledge Button */}
      {user?.acceptedTerms ? (
        <View style={styles.acknowledgedButton}>
          <FontAwesome
            name="check"
            size={20}
            color="#fff"
            style={styles.checkmark}
          />

          <Text style={styles.acknowledgeButtonText}>Terms Accepted</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.acknowledgeButton}
          onPress={handleAcknowledge}
        >
          <Text style={styles.acknowledgeButtonText}>I Acknowledge</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: munchColors.primary,
    padding: 15,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
    margin: 20,
  },
  acknowledgedButton: {
    backgroundColor: "grey",
    padding: 15,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
    margin: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  acknowledgeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkmark: {
    marginRight: 10,
  },
});
