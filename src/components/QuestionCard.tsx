import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@theme/colors";

const QuestionCard: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4
  }
});

export default QuestionCard;
