import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreeningWizardScreen from "@screens/ScreeningWizardScreen";
import HistoryScreen from "@screens/HistoryScreen";
import HistoryDetailScreen from "@screens/HistoryDetailScreen";
import DashboardScreen from "@screens/DashboardScreen";
import LoginScreen from "@screens/LoginScreen";
import { useAuth } from "@store/AuthContext";
import { useTranslation } from "react-i18next";

export type RootStackParamList = {
  Tabs: undefined;
  HistoryDetail: { id: number };
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabsNavigator = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Screening"
        component={ScreeningWizardScreen}
        options={{ title: t("screening") }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: t("dashboard") }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: t("history") }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAdmin } = useAuth();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={TabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: "รายละเอียด" }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "เข้าสู่ระบบ (สำหรับเจ้าหน้าที่)" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
