import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@theme/colors";
import PrimaryButton from "./PrimaryButton";

interface Props {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<Props> = ({ message, onRetry }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{message}</Text>
    {onRetry && <PrimaryButton title="ลองใหม่" onPress={onRetry} />}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center"
  },
  text: {
    color: colors.danger,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8
  }
});

export default ErrorState;
