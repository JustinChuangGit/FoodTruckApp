import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

interface CustomCheckboxProps {
  value: boolean; // Represents whether the checkbox is checked
  onValueChange: (value: boolean) => void; // Callback when the checkbox state changes
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={styles.checkbox}
    >
      {value && <View style={styles.innerCheckbox} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  innerCheckbox: {
    width: 16,
    height: 16,
    backgroundColor: "#4CAF50",
  },
});

export default CustomCheckbox;
