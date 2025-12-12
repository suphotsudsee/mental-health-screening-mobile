import React from "react";
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from "react-native";
import colors from "@theme/colors";

interface Props {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  disabled?: boolean;
}

const PrimaryButton: React.FC<Props> = ({ title, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.button, disabled && { opacity: 0.5 }]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginVertical: 8
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  }
});

export default PrimaryButton;
