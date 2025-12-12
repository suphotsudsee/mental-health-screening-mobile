import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@theme/colors";
import { RiskLevel } from "@logic/riskCalculator";

const levelColor: Record<RiskLevel, string> = {
  none: colors.success,
  low: colors.warning,
  medium: "#F57C00",
  high: colors.danger
};

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => (
  <View style={[styles.badge, { backgroundColor: levelColor[level] }]}>
    <Text style={styles.text}>{level.toUpperCase()}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12
  }
});

export default RiskBadge;
