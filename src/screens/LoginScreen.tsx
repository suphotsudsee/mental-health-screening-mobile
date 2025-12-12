import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import PrimaryButton from "@components/PrimaryButton";
import { useAuth } from "@store/AuthContext";
import colors from "@theme/colors";
import { useTranslation } from "react-i18next";

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  const onSubmit = async () => {
    const ok = await login(username, password);
    if (!ok) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", "กรุณาตรวจสอบ username/password");
      return;
    }
    Alert.alert("สำเร็จ", "เข้าสู่โหมดเจ้าหน้าที่แล้ว");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("login")}</Text>
      <Text style={styles.hint}>{t("loginHint")}</Text>
      <TextInput
        style={styles.input}
        placeholder="username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton title="เข้าสู่ระบบ" onPress={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  hint: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8
  }
});

export default LoginScreen;
