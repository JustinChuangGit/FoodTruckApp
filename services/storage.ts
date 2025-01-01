import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage(); // Initialize storage

export const uploadImage = async (uri: string, path: string): Promise<string> => {
    try {
      console.log("Starting image upload...");
      console.log("URI:", uri);
      console.log("Path:", path);
  
      // Convert URI to Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log("Blob created successfully.");
  
      // Create a reference in Firebase Storage
      const storageRef = ref(storage, path);
      console.log("Storage reference created:", storageRef.fullPath);
  
      // Upload the file
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log("Upload result:", uploadResult);
  
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("File uploaded successfully:", downloadURL);
  
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };
  
