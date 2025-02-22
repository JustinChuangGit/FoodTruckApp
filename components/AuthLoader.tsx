// AuthLoader.tsx
import React, { useEffect } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "../firebaseConfig"; // Ensure your firebaseConfig exports your Firebase app
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../redux/authSlice";
import { useRouter } from "expo-router";
import { getUserData } from "../services/firestore"; // Adjust the path if needed
import { auth } from "@/services/auth";

export default function AuthLoader() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const firestoreData = await getUserData(firebaseUser.uid);
          if (!firestoreData) {
            // If there's no Firestore data, clear user state and redirect to Login.
            dispatch(clearUser());
            router.replace("/auth/LoginScreen");
            return;
          }
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firestoreData.name || firebaseUser.displayName || "",
            ...firestoreData,
          };
          dispatch(setUser(userData));
          // Redirect based on whether the user is a vendor.
          if (userData.isVendor) {
            router.replace("/vendor");
          } else {
            router.replace("/user");
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          dispatch(clearUser());
          router.replace("/auth/LoginScreen");
        }
      } else {
        dispatch(clearUser());
        router.replace("/auth/LoginScreen");
      }
    });
    return unsubscribe;
  }, [dispatch, router, auth]);

  return null;
}
