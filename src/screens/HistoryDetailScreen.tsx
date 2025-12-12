import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/AppNavigator";
import colors from "@theme/colors";
import { ScreeningRecord, fetchScreenings } from "@services/screeningService";
import LoadingOverlay from "@components/LoadingOverlay";
import PrimaryButton from "@components/PrimaryButton";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type Route = RouteProp<RootStackParamList, "HistoryDetail">;

const HistoryDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const { id } = route.params;

  const [record, setRecord] = useState<ScreeningRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchScreenings(500);
        const found = list.find((x) => x.id === id) || null;
        setRecord(found);
      } catch (e) {
        console.error(e);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const exportPdf = async () => {
    if (!record) return;

    const html = `
      <html lang="th">
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: sans-serif; padding: 24px; }
            h1 { font-size: 20px; }
            p { font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>รายงานผลคัดกรองสุขภาพจิต</h1>
          <p><strong>ชื่อ-สกุล:</strong> ${record.fullname || "-"}</p>
          <p><strong>เลขบัตรประชาชน:</strong> ${record.citizen_id || "-"}</p>
          <p><strong>หน่วยบริการ:</strong> ${record.facility_code || "-"}</p>
          <p><strong>วันที่คัดกรอง:</strong> ${new Date(
            record.created_at
          ).toLocaleString("th-TH")}</p>
          <p><strong>คะแนนเครียด:</strong> ${record.stress_score ?? "-"}</p>
          <p><strong>คะแนนรวม 8Q:</strong> ${record.q8_total}</p>
          <p><strong>ระดับความเสี่ยง:</strong> ${record.risk_level.toUpperCase()}</p>
          <p><strong>ข้อแนะนำ:</strong> ${record.recommendation}</p>
        </body>
      </html>
    `;

    try {
      const file = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(file.uri);
    } catch (e) {
      console.error(e);
      Alert.alert("ส่งออกไม่สำเร็จ", "ไม่สามารถสร้างไฟล์ PDF ได้");
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!record) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายละเอียดการคัดกรอง</Text>
      <Text style={styles.item}>
        วันที่: {new Date(record.created_at).toLocaleString("th-TH")}
      </Text>
      <Text style={styles.item}>ชื่อ: {record.fullname || "-"}</Text>
      <Text style={styles.item}>เลขบัตร: {record.citizen_id || "-"}</Text>
      <Text style={styles.item}>
        หน่วยบริการ: {record.facility_code || "-"}
      </Text>
      <Text style={styles.item}>
        คะแนนเครียด: {record.stress_score ?? "-"}
      </Text>
      <Text style={styles.item}>8Q รวม: {record.q8_total}</Text>
      <Text style={styles.item}>
        ระดับเสี่ยง: {record.risk_level.toUpperCase()}
      </Text>
      <Text style={styles.item}>ข้อแนะนำ: {record.recommendation}</Text>

      <PrimaryButton title="Export / Share PDF" onPress={exportPdf} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  item: { fontSize: 14, marginBottom: 4, color: colors.text }
});

export default HistoryDetailScreen;
