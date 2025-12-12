import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, RefreshControl, ScrollView } from "react-native";
import colors from "@theme/colors";
import { fetchScreenings, ScreeningRecord } from "@services/screeningService";
import RiskBadge from "@components/RiskBadge";
import ErrorState from "@components/ErrorState";

const DashboardScreen: React.FC = () => {
  const [data, setData] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchScreenings(500);
      setData(res);
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = data.reduce(
    (acc, cur) => {
      acc[cur.risk_level] += 1;
      return acc;
    },
    { none: 0, low: 0, medium: 0, high: 0 }
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} />
      }
    >
      <Text style={styles.title}>ภาพรวมการคัดกรอง</Text>
      {error && <ErrorState message={error} onRetry={load} />}
      <View style={styles.card}>
        <Text style={styles.total}>รวม {data.length} ราย</Text>
        {(["none", "low", "medium", "high"] as const).map((level) => (
          <View key={level} style={styles.row}>
            <RiskBadge level={level} />
            <Text style={styles.count}>{counts[level]} ราย</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  total: { fontSize: 16, marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4
  },
  count: { fontSize: 16, fontWeight: "600", color: colors.text }
});

export default DashboardScreen;
