# Mental Health Screening Mobile App

แอปคัดกรองสุขภาพจิตสำหรับ iOS/Android เชื่อมต่อกับ backend Next.js เดิม (`mental-health-screening`)

## Tech Stack

- React Native + TypeScript
- Expo
- React Navigation
- Axios (REST API)
- expo-print + expo-sharing (Export/Share PDF)
- expo-secure-store (เก็บ session admin)
- i18next (i18n, th เป็น default)

## REST API (เชื่อมกับ backend เดิม)

ใช้ BASE_URL จาก `.env` เช่น `https://your-nextjs-domain.com`

- `GET {BASE_URL}/api/screenings?limit=500`
- `POST {BASE_URL}/api/screenings`
- `POST {BASE_URL}/api/line-notify`

ฝั่ง backend ต้องมี env:

- `DB_HOST, DB_USER, DB_PASSWORD, DB_NAME`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `NEXT_PUBLIC_ENABLE_LINE_NOTIFY`

## การตั้งค่า environment

คัดลอกไฟล์

```bash
cp .env.example .env
