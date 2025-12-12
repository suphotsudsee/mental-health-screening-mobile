import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import colors from "@theme/colors";
import { ScreeningRecord, fetchScreenings } from "@services/screeningService";
import ErrorState from "@components/ErrorState";
import LoadingOverlay from "@components/LoadingOverlay";
import RiskBadge from "@components/RiskBadge";
import { useAuth } from "@store/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList, "Tabs">;

const HistoryScreen: React.FC = () => {
  const [data, setData] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const navigation = useNavigation<Nav>();

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchScreenings(500);
      // assume backend already sorted desc; if not, sort here
      setData(res);
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }: { item: ScreeningRecord }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("HistoryDetail", { id: item.id })
      }
    >
      <View style={styles.row}>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleString("th-TH")}
        </Text>
        <RiskBadge level={item.risk_level} />
      </View>
      <Text style={styles.text}>
        คะแนนเครียด: {item.stress_score ?? "-"}, 8Q: {item.q8_total}
      </Text>
      {isAdmin ? (
        <Text style={styles.text}>
          {item.fullname || "(ไม่ระบุชื่อ)"} - {item.citizen_id || "-"}
        </Text>
      ) : (
        <Text style={styles.text}>ซ่อนด้วย privacy</Text>
      )}
    </TouchableOpacity>
  );

  if (initialLoading && !error) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      {error && <ErrorState message={error} onRetry={load} />}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 8 },
  item: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  time: { fontSize: 14, color: colors.textSecondary },
  text: { fontSize: 14, color: colors.text }
});

export default HistoryScreen;
