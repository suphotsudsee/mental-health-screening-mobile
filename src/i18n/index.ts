import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  th: {
    translation: {
      appTitle: "คัดกรองสุขภาพจิต",
      screening: "คัดกรอง",
      history: "ประวัติ",
      dashboard: "แดชบอร์ด",
      login: "เข้าสู่ระบบ",
      citizenId: "เลขบัตรประชาชน",
      fullname: "ชื่อ-สกุล",
      facilityCode: "รหัสหน่วยบริการ",
      stressQuestion: "ช่วง 2 สัปดาห์ที่ผ่านมา ท่านมีความเครียดมากน้อยเพียงใด?",
      next: "ถัดไป",
      back: "ย้อนกลับ",
      save: "บันทึก",
      share: "แชร์",
      risk_none: "ไม่มีความเสี่ยง",
      risk_low: "เสี่ยงต่ำ",
      risk_medium: "เสี่ยงปานกลาง",
      risk_high: "เสี่ยงสูง",
      adminOnlyHidden: "ซ่อนด้วย privacy",
      loginHint: "username: admin, password: 00022"
    }
  },
  en: {
    translation: {
      appTitle: "Mental Health Screening",
      screening: "Screening",
      history: "History",
      dashboard: "Dashboard",
      login: "Login",
      citizenId: "Citizen ID",
      fullname: "Full name",
      facilityCode: "Facility code",
      stressQuestion: "In the last 2 weeks, how stressed have you felt?",
      next: "Next",
      back: "Back",
      save: "Save",
      share: "Share",
      risk_none: "No risk",
      risk_low: "Low risk",
      risk_medium: "Medium risk",
      risk_high: "High risk",
      adminOnlyHidden: "Hidden by privacy",
      loginHint: "username: admin, password: 00022"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "th",
  fallbackLng: "th",
  interpolation: { escapeValue: false }
});

export default i18n;
