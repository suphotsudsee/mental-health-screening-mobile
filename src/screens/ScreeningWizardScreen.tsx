import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Switch
} from "react-native";
import colors from "@theme/colors";
import PrimaryButton from "@components/PrimaryButton";
import QuestionCard from "@components/QuestionCard";
import { useTranslation } from "react-i18next";
import {
  calculateRisk,
  RiskLevel,
  RiskResult
} from "@logic/riskCalculator";
import {
  createScreening,
  ScreeningRecord,
  ScreeningPayload
} from "@services/screeningService";
import { sendLineNotifyIfNeeded } from "@services/lineService";

type Step = 0 | 1 | 2 | 3 | 4;

const eightQQuestions = [
  "1. รู้สึกหดหู่ เศร้า หรือท้อแท้เกือบทุกวัน",
  "2. รู้สึกเบื่อ ทำอะไรไม่เพลิดเพลินเหมือนเดิม",
  "3. รู้สึกโทษตัวเอง หรือรู้สึกว่าตนเองไร้ค่า",
  "4. มีปัญหาเรื่องการนอน เช่น นอนไม่หลับ หรือนอนมาก",
  "5. เบื่ออาหาร หรือกินมากผิดปกติ",
  "6. รู้สึกไม่อยากพบปะผู้คน แยกตัวออกจากผู้อื่น",
  "7. คิดว่าอยากตาย หรืออยากทำร้ายตัวเอง",
  "8. เคยพยายามทำร้ายตนเอง หรือคิดแผนการไว้อย่างชัดเจน"
];

const ScreeningWizardScreen: React.FC = () => {
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>(0);

  const [citizenId, setCitizenId] = useState("");
  const [fullname, setFullname] = useState("");
  const [facilityCode, setFacilityCode] = useState("");

  const [stressScore, setStressScore] = useState<number | null>(null); // 1–5

  const [q1, setQ1] = useState<0 | 1>(0);
  const [q2, setQ2] = useState<0 | 1>(0);
  const [q3, setQ3] = useState<0 | 1>(0);

  const [eightAnswers, setEightAnswers] = useState<(0 | 1)[]>(
    Array(8).fill(0) as (0 | 1)[]
  );

  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [savedRecord, setSavedRecord] = useState<ScreeningRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    if (step === 0) return setStep(1);
    if (step === 1) return setStep(2);
    if (step === 2) {
      if (q3 === 1) return setStep(3);
      handleCalculateResult();
      return;
    }
    if (step === 3) {
      handleCalculateResult();
      return;
    }
  };

  const goBack = () => {
    if (step === 0) return;
    if (step === 4) return setStep(3);
    setStep((prev) => ((prev - 1) as Step));
  };

  const toggleEightAnswer = (index: number) => {
    setEightAnswers((prev) => {
      const clone = [...prev] as (0 | 1)[];
      clone[index] = clone[index] === 1 ? 0 : 1;
      return clone;
    });
  };

  const handleCalculateResult = () => {
    const result = calculateRisk({
      stressScore,
      q1,
      q2,
      q3,
      eightQAnswers: eightAnswers
    });
    setRiskResult(result);
    setStep(4);
  };

  const handleSave = async () => {
    if (!riskResult) return;
    const payload: ScreeningPayload = {
      citizen_id: citizenId || null,
      fullname: fullname || null,
      facility_code: facilityCode || null,
      stress_score: stressScore,
      q1,
      q2,
      q3,
      q8_total: riskResult.total8,
      risk_level: riskResult.riskLevel,
      recommendation: riskResult.recommendation
    };

    try {
      setLoading(true);
      const record = await createScreening(payload);
      setSavedRecord(record);
      await sendLineNotifyIfNeeded(record);
      Alert.alert("บันทึกสำเร็จ", "บันทึกข้อมูลคัดกรองแล้ว");
    } catch (e) {
      console.error(e);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(0);
    setCitizenId("");
    setFullname("");
    setFacilityCode("");
    setStressScore(null);
    setQ1(0);
    setQ2(0);
    setQ3(0);
    setEightAnswers(Array(8).fill(0) as (0 | 1)[]);
    setRiskResult(null);
    setSavedRecord(null);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <QuestionCard title="ข้อมูลทั่วไป" />
            <TextInput
              style={styles.input}
              placeholder={t("citizenId")}
              keyboardType="numeric"
              value={citizenId}
              onChangeText={setCitizenId}
            />
            <TextInput
              style={styles.input}
              placeholder={t("fullname")}
              value={fullname}
              onChangeText={setFullname}
            />
            <TextInput
              style={styles.input}
              placeholder={t("facilityCode")}
              value={facilityCode}
              onChangeText={setFacilityCode}
            />
          </View>
        );
      case 1:
        return (
          <View>
            <QuestionCard
              title={t("stressQuestion")}
              subtitle="1 = เลยน้อย 5 = เครียดมาก"
            />
            <View style={styles.row}>
              {[1, 2, 3, 4, 5].map((v) => (
                <PrimaryButton
                  key={v}
                  title={v.toString()}
                  onPress={() => setStressScore(v)}
                  disabled={false}
                />
              ))}
            </View>
            {stressScore && (
              <Text style={styles.selectedText}>
                เลือก: {stressScore} / 5
              </Text>
            )}
          </View>
        );
      case 2:
        return (
          <View>
            <QuestionCard title="2Q Plus" />
            {[
              "1. ช่วง 2 สัปดาห์ที่ผ่านมา รู้สึกหดหู่ เศร้า หรือท้อแท้",
              "2. ช่วง 2 สัปดาห์ที่ผ่านมา รู้สึกเบื่อ ทำอะไรไม่เพลิดเพลิน",
              "3. ช่วง 1 เดือนที่ผ่านมา เคยคิดอยากตาย หรือทำร้ายตนเอง"
            ].map((q, idx) => {
              const state = [q1, q2, q3][idx];
              const setter = [setQ1, setQ2, setQ3][idx];
              return (
                <View key={idx} style={styles.switchRow}>
                  <Text style={styles.questionText}>{q}</Text>
                  <View style={styles.switchWrap}>
                    <Text>ไม่ใช่</Text>
                    <Switch
                      value={state === 1}
                      onValueChange={(v) => setter(v ? 1 : 0)}
                    />
                    <Text>ใช่</Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      case 3:
        return (
          <View>
            <QuestionCard title="8Q" subtitle="ตอบตามความเป็นจริง" />
            {eightQQuestions.map((q, idx) => (
              <View key={idx} style={styles.switchRow}>
                <Text style={styles.questionText}>{q}</Text>
                <View style={styles.switchWrap}>
                  <Text>ไม่ใช่</Text>
                  <Switch
                    value={eightAnswers[idx] === 1}
                    onValueChange={() => toggleEightAnswer(idx)}
                  />
                  <Text>ใช่</Text>
                </View>
              </View>
            ))}
          </View>
        );
      case 4:
        if (!riskResult) return null;
        return (
          <View>
            <QuestionCard title="ผลการคัดกรอง" />
            <Text style={styles.resultText}>
              คะแนนเครียด: {stressScore ?? "-"} / 5
            </Text>
            <Text style={styles.resultText}>
              8Q รวม: {riskResult.total8}
            </Text>
            <Text style={styles.resultText}>
              ระดับความเสี่ยง: {riskResult.riskLevel.toUpperCase()}
            </Text>
            {riskResult.hasEmergency && (
              <Text style={[styles.resultText, { color: colors.danger }]}>
                พบข้อฉุกเฉิน (ข้อ 7 หรือ 8 ตอบใช่)
              </Text>
            )}
            <Text style={[styles.resultText, { marginTop: 8 }]}>
              ข้อแนะนำ: {riskResult.recommendation}
            </Text>
            <PrimaryButton title="บันทึก" onPress={handleSave} />
            <PrimaryButton title="เริ่มใหม่" onPress={resetAll} />
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>แบบคัดกรองสุขภาพจิต</Text>
      <Text style={styles.stepText}>ขั้นตอนที่ {step + 1} / 5</Text>
      {renderStep()}
      <View style={styles.navButtons}>
        {step > 0 && step < 4 && (
          <PrimaryButton title={t("back")} onPress={goBack} />
        )}
        {step < 4 && (
          <PrimaryButton title={t("next")} onPress={goNext} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.text
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  selectedText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary
  },
  switchRow: {
    marginBottom: 12
  },
  questionText: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.text
  },
  switchWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8
  },
  navButtons: {
    marginTop: 16
  },
  resultText: {
    fontSize: 16,
    marginVertical: 2,
    color: colors.text
  }
});

export default ScreeningWizardScreen;
