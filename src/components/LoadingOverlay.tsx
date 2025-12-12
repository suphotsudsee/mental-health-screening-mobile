import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import colors from "@theme/colors";

const LoadingOverlay = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default LoadingOverlay;
