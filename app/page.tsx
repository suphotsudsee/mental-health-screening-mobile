"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Heart,
  Brain,
  Coffee,
  Moon,
  Frown,
  Battery,
  UserX,
  AlertOctagon,
  Info,
  ChevronLeft,
  CloudRain,
  Sun,
  CheckCircle2,
  HeartCrack,
  BatteryWarning,
} from "lucide-react";

type StressGaugeProps = {
  onNext: (level: number) => void;
  welcomeName?: string | null;
  autoStart?: boolean;
};

type TwoQPlusProps = {
  onNext: () => void;
  onHome: () => void;
  onResult: (result: TwoQResult) => void;
};

type NineQProps = {
  onHome: () => void;
  onComplete: (result: NineQResult) => void;
};

type TwoQResult = {
  q1: boolean;
  q2: boolean;
  risk: boolean;
};

type NineQResult = {
  score: number;
  severity: string;
  hasSuicideRisk: boolean;
};

type AssessmentPayload = {
  stressLevel: number | null;
  twoQ: TwoQResult | null;
  nineQScore: number | null;
  nineQSeverity: string | null;
  hasSuicideRisk: boolean;
  lineUserId?: string | null;
  lineGroupId?: string | null;
};

type SubmissionState = "idle" | "saving" | "error" | "success";

// --- 1. COMPONENT: STRESS GAUGE (CANVAS) ---
const StressGauge = ({ onNext, welcomeName, autoStart }: StressGaugeProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [level, setLevel] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(-Math.PI); // Start at Left (-PI)
  const greetingName = welcomeName ? `สวัสดี คุณ ${welcomeName}` : "สวัสดี เพื่อน LINE";

  const levels = useMemo(
    () => [
      { id: 1, label: "สบายดี", desc: "รู้สึกโล่งใจ ผ่อนคลาย นอนหลับได้ปกติ", color: "#22c55e", emoji: "🙂" },
      { id: 2, label: "เริ่มตึงเครียด", desc: "มีเรื่องกังวลบ้าง แต่ยังควบคุมได้", color: "#84cc16", emoji: "😐" },
      { id: 3, label: "เครียดปานกลาง", desc: "เหนื่อยล้า นอนไม่ค่อยหลับ เบื่ออาหาร", color: "#eab308", emoji: "😟" },
      { id: 4, label: "เครียดมาก", desc: "หงุดหงิด ใจเต้นเร็ว ปวดหัวบ่อย", color: "#f97316", emoji: "😣" },
      { id: 5, label: "เครียดสุดๆ", desc: "น้ำตาคลอ ควบคุมอารมณ์ลำบาก อยากอยู่คนเดียว", color: "#ef4444", emoji: "😢" },
    ],
    []
  );

  const getEmoji = useCallback(
    (lvl: number) => (lvl === 0 ? "👆" : levels[lvl - 1].emoji),
    [levels]
  );

  const drawGauge = useCallback(
    (currentAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr; // use CSS pixel size for drawing
      const height = canvas.height / dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset scale each draw
      const cx = width / 2;
      const cy = height * 0.9; // lower pivot for more top clearance
      const radius = Math.min(width, height) * 0.75; // slightly smaller to avoid clipping

      ctx.clearRect(0, 0, width, height);

      // Draw Top Semicircle: -PI (Left) to 0 (Right)
      const totalSegments = 5;
      const segmentAngle = Math.PI / totalSegments;

      for (let i = 0; i < totalSegments; i++) {
        ctx.beginPath();
        const start = -Math.PI + i * segmentAngle;
        const end = -Math.PI + (i + 1) * segmentAngle;

        ctx.arc(cx, cy, radius, start, end);
        ctx.lineWidth = width * 0.1; // Responsive width
        ctx.strokeStyle = levels[i].color;
        ctx.stroke();

        // Labels
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const mid = start + segmentAngle / 2;
        ctx.fillText(String(i + 1), cx + Math.cos(mid) * radius, cy + Math.sin(mid) * radius);
      }

      // Needle
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const needleR = radius - 20;
      ctx.lineTo(cx + Math.cos(currentAngle) * needleR, cy + Math.sin(currentAngle) * needleR);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();

      // Pivot
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.12, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();

      // Emoji
      ctx.font = `${width * 0.1}px serif`;
      ctx.fillStyle = "black";
      ctx.fillText(getEmoji(level), cx, cy + 5);
    },
    [getEmoji, level, levels]
  );

  const handleInteract = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height * 0.85;

    let clientX: number;
    let clientY: number;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      const mouseEvent = e as React.MouseEvent<HTMLDivElement>;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate Angle (-PI to 0)
    let rad = Math.atan2(y - cy, x - cx);
    if (rad > 0) rad = 0; // Clamp if below horizon (right side)
    if (rad < -Math.PI) rad = -Math.PI; // Clamp left side

    setAngle(rad);

    // Calculate Level
    const normalized = rad + Math.PI; // 0 to PI
    const segment = Math.PI / levels.length;
    const newLevel = Math.min(levels.length, Math.max(1, Math.ceil(normalized / segment)));
    setLevel(newLevel);
  };

  useEffect(() => {
    drawGauge(angle);
  }, [angle, level, drawGauge]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const width = containerRef.current.offsetWidth;
      const height = Math.min(width * 0.6, window.innerHeight * 0.55); // keep gauge within viewport
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      drawGauge(angle);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [angle, level, drawGauge]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="px-6 pt-5 pb-3 text-center">
        <h2 className="text-2xl font-bold text-slate-800">วันนี้คุณรู้สึกเครียดแค่ไหน?</h2>
        <p className="text-slate-500 mt-1 text-sm">เลื่อนเข็มบนมาตรวัดเพื่อเลือกระดับความเครียดของคุณ</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 px-4">
        <div
          ref={containerRef}
          className="w-full max-w-xl mx-auto relative touch-none cursor-pointer"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleInteract(e);
          }}
          onMouseMove={(e) => {
            if (isDragging) handleInteract(e);
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => {
            setIsDragging(true);
            handleInteract(e);
          }}
          onTouchMove={(e) => {
            if (isDragging) handleInteract(e);
          }}
          onTouchEnd={() => setIsDragging(false)}
        >
          <canvas ref={canvasRef} className="w-full rounded-3xl" />
          {level === 0 && (
            <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce text-slate-300 text-sm font-bold pointer-events-none">
              แตะหรือเลื่อนบนมาตรวัดเพื่อเริ่ม
            </div>
          )}
        </div>

        <div className={`transition-all duration-300 ${level > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div
            className="bg-white p-4 rounded-xl shadow-md border-l-4 flex gap-3 items-center"
            style={{ borderLeftColor: level > 0 ? levels[level - 1].color : "transparent" }}
          >
            <div className="flex-1">
              <h3 className="font-bold text-slate-700">{level > 0 && levels[level - 1].label}</h3>
              <p className="text-xs text-slate-500">{level > 0 && levels[level - 1].desc}</p>
            </div>
            {level >= 3 && <AlertTriangle className="text-orange-500 w-6 h-6 animate-pulse" />}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <button
          disabled={level === 0}
          onClick={() => onNext(level)}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
            ${level > 0 ? "bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}
          `}
        >
          ไปต่อ <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// --- 2. COMPONENT: 2Q PLUS ---
const TwoQPlus = ({ onNext, onHome, onResult }: TwoQPlusProps) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<{ q1: boolean | null; q2: boolean | null }>({ q1: null, q2: null });
  const hasReported = useRef(false);

  const questions = [
    {
      id: 1,
      key: "q1",
      title: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณรู้สึกไม่สนใจหรือไม่อยากทำอะไรเลยหรือไม่?",
      icon: <CloudRain size={64} className="text-blue-400" />,
      theme: "bg-blue-50",
    },
    {
      id: 2,
      key: "q2",
      title: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณรู้สึกเศร้า ท้อแท้ หรือสิ้นหวังหรือไม่?",
      icon: <HeartCrack size={64} className="text-rose-400" />,
      theme: "bg-rose-50",
    },
  ];

  const handleAnswer = (val: boolean) => {
    const key = questions[step - 1].key;
    const newAnswers = { ...answers, [key]: val };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step < 2) setStep(step + 1);
      else setStep(3); // Result
    }, 200);
  };

  const isRisk = Boolean(answers.q1 || answers.q2);

  useEffect(() => {
    if (step === 3 && !hasReported.current) {
      hasReported.current = true;
      onResult({
        q1: Boolean(answers.q1),
        q2: Boolean(answers.q2),
        risk: Boolean(answers.q1 || answers.q2),
      });
    }
  }, [step, answers, onResult]);

  // Render Result Phase
  if (step === 3) {
    return (
      <div className="flex flex-col h-full animate-in zoom-in-95 duration-500 bg-white">
        <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${isRisk ? "bg-orange-50" : "bg-green-50"}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl text-white ${isRisk ? "bg-orange-500" : "bg-green-500"}`}>
            {isRisk ? <BatteryWarning size={48} /> : <Sun size={48} />}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isRisk ? "text-orange-700" : "text-green-700"}`}>
            {isRisk ? "พบความเสี่ยงภาวะซึมเศร้า" : "ยังไม่พบสัญญาณน่ากังวล"}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-[280px]">
            {isRisk
              ? "แนะนำให้ทำแบบประเมิน 9Q ต่อเพื่อดูระดับอาการ และหากรู้สึกแย่ลงควรปรึกษาแพทย์หรือสายด่วนสุขภาพจิต"
              : "ถ้ายังรู้สึกไม่สบายใจ สามารถกลับมาประเมินได้อีก หรือปรึกษาเจ้าหน้าที่สุขภาพจิต"}
          </p>
        </div>
        <div className="p-6 bg-white space-y-3">
          {isRisk ? (
            <button
              onClick={onNext}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 flex items-center justify-center gap-2 animate-pulse"
            >
              ทำแบบประเมิน 9Q ต่อ <ArrowRight size={20} />
            </button>
          ) : (
            <button onClick={onHome} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
              กลับหน้าแรก <CheckCircle2 size={20} />
            </button>
          )}
          {isRisk && (
            <button onClick={onHome} className="w-full py-3 text-slate-400 text-sm">
              กลับหน้าแรก
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Question Phase
  const q = questions[step - 1];
  return (
    <div className={`flex flex-col h-full ${q.theme} transition-colors duration-500`}>
      <div className="p-4">
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }}></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-right duration-300" key={step}>
        <div className="mb-6 animate-bounce delay-700">{q.icon}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{q.title}</h2>
        <p className="text-slate-500 text-sm">ตอบตามความรู้สึกในช่วง 2 สัปดาห์ที่ผ่านมา</p>
      </div>
      <div className="p-6 bg-white rounded-t-3xl shadow-lg space-y-3">
        <button
          onClick={() => handleAnswer(true)}
          className="w-full py-4 rounded-xl border-2 border-slate-100 font-bold text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 flex items-center justify-center gap-3"
        >
          <div className="w-5 h-5 rounded-full border border-slate-300 bg-white"></div> ใช่ / มีอาการ
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="w-full py-4 rounded-xl border-2 border-slate-100 font-bold text-slate-700 hover:bg-green-50 hover:border-green-200 hover:text-green-600 flex items-center justify-center gap-3"
        >
          <div className="w-5 h-5 rounded-full border border-slate-300 bg-white"></div> ไม่ใช่ / ไม่มีอาการ
        </button>
      </div>
    </div>
  );
};

// --- 3. COMPONENT: 9Q ---
const NineQ = ({ onHome, onComplete }: NineQProps) => {
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [hasSuicideRisk, setHasSuicideRisk] = useState(false);
  const hasReported = useRef(false);

  const questions = [
    { text: "ทำกิจกรรมต่างๆ แล้วรู้สึกไม่สนใจหรือไม่เพลิดเพลิน", icon: <Coffee className="text-slate-500" /> },
    { text: "รู้สึกเศร้า ท้อแท้ หรือสิ้นหวัง", icon: <Frown className="text-blue-500" /> },
    { text: "มีปัญหาการนอน หลับยาก หลับไม่สนิท หรือหลับมากไป", icon: <Moon className="text-indigo-500" /> },
    { text: "รู้สึกเหนื่อยง่าย หรือหมดพลังงาน", icon: <Battery className="text-orange-500" /> },
    { text: "เบื่ออาหารหรือกินมากกว่าปกติ", icon: <UserX className="text-green-500" /> },
    { text: "รู้สึกแย่กับตัวเอง หรือคิดว่าตัวเองล้มเหลวทำให้คนรอบข้างผิดหวัง", icon: <Heart className="text-rose-500" /> },
    { text: "มีปัญหาสมาธิ เช่น อ่านหนังสือหรือดูทีวีแล้วจดจ่อได้ยาก", icon: <Brain className="text-purple-500" /> },
    { text: "พูดหรือเคลื่อนไหวช้าลงจนคนอื่นสังเกต หรือกระสับกระส่ายผิดปกติ", icon: <RefreshCw className="text-yellow-600" /> },
    { text: "มีความคิดว่าถ้าตายไปคงดี หรือคิดทำร้ายตนเอง", icon: <AlertOctagon className="text-red-600" /> },
  ];

  const handleAnswer = (val: number) => {
    setScore((s) => s + val);
    if (step === 9 && val > 0) setHasSuicideRisk(true); // Check Q9 logic

    if (step < 9) setStep(step + 1);
    else setStep(10); // Result
  };

  const getResult = () => {
    if (score < 7) return { level: "อาการซึมเศร้าต่ำ", color: "text-green-600", bg: "bg-green-50", severity: "minimal" };
    if (score < 13) return { level: "อาการซึมเศร้าระดับเล็กน้อย", color: "text-yellow-600", bg: "bg-yellow-50", severity: "mild" };
    if (score < 19) return { level: "อาการซึมเศร้าปานกลาง", color: "text-orange-600", bg: "bg-orange-50", severity: "moderate" };
    return { level: "อาการซึมเศร้ารุนแรง", color: "text-red-600", bg: "bg-red-50", severity: "severe" };
  };

  useEffect(() => {
    if (step === 10 && !hasReported.current) {
      hasReported.current = true;
      const res = getResult();
      onComplete({
        score,
        hasSuicideRisk,
        severity: res.severity,
      });
    }
  }, [step, score, hasSuicideRisk, onComplete]);

  if (step === 10) {
    const res = getResult();
    return (
      <div className="flex flex-col h-full animate-in zoom-in-95 duration-500 bg-white">
        <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center ${res.bg}`}>
          <h2 className={`text-5xl font-bold mb-2 ${res.color}`}>{score}</h2>
          <h3 className={`text-xl font-bold mb-4 ${res.color}`}>{res.level}</h3>
          {hasSuicideRisk && (
            <div className="bg-red-100 p-3 rounded-lg border border-red-200 mt-2 flex gap-2 text-left">
              <AlertOctagon className="text-red-600 shrink-0" />
              <p className="text-xs text-red-700">
                หากมีความคิดทำร้ายตนเองหรือคิดว่าถ้าตายไปคงดี โปรดโทรหา <strong>สายด่วนสุขภาพจิต 1323</strong> หรือแจ้งคนใกล้ตัวให้ช่วยทันที
              </p>
            </div>
          )}
        </div>
        <div className="p-6 bg-white space-y-3">
          <button onClick={onHome} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">
            กลับหน้าแรก
          </button>
          <a href="tel:1323" className="block w-full text-center py-3 bg-red-50 text-red-600 rounded-xl font-bold">
            สายด่วนสุขภาพจิต 1323
          </a>
        </div>
      </div>
    );
  }

  const q = questions[step - 1];
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-6 pt-6 pb-2 bg-white shadow-sm z-10">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
          <span>แบบประเมิน 9Q {step}/9</span> <span>{Math.round((step / 9) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(step / 9) * 100}%` }}></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 text-center animate-in slide-in-from-right" key={step}>
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">{React.cloneElement(q.icon, { size: 48 })}</div>
        <h2 className="text-xl font-bold text-slate-800">{q.text}</h2>
      </div>
      <div className="grid grid-cols-1 gap-2 p-4 pb-8">
        {[
          { l: "ไม่เลย", s: 0, c: "bg-white" },
          { l: "เป็นบางวัน", s: 1, c: "bg-yellow-50 border-yellow-100" },
          { l: "บ่อยๆ", s: 2, c: "bg-orange-50 border-orange-100" },
          { l: "เกือบทุกวัน", s: 3, c: "bg-red-50 border-red-100" },
        ].map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt.s)} className={`p-4 rounded-xl border text-left font-bold text-slate-700 ${opt.c}`}>
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ORCHESTRATOR ---
export default function MentalHealthApp() {
  const [view, setView] = useState("home"); // home (gauge), 2q, 9q
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [twoQResult, setTwoQResult] = useState<TwoQResult | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [fromLineMiniApp, setFromLineMiniApp] = useState(false);
  const [showLineWelcome, setShowLineWelcome] = useState(false);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [lineGroupId, setLineGroupId] = useState<string | null>(null);
  const lineInitRef = useRef(false);

  const goTo2Q = () => setView("2q");
  const goTo9Q = () => setView("9q");

  const resetFlow = useCallback(() => {
    setView("home");
    setStressLevel(null);
    setTwoQResult(null);
    setSubmissionState("idle");
    setSubmitError(null);
  }, []);

  const goHome = () => resetFlow();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lineInitRef.current) return;

    const referrer = document.referrer || "";
    const host = window.location.hostname;
    const isFromLine = host.includes("miniapp.line.me") || referrer.includes("miniapp.line.me");
    if (!isFromLine) return;

    lineInitRef.current = true;
    setFromLineMiniApp(true);
    resetFlow();

    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { default: liff } = await import("@line/liff");
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          console.warn("[LINE] NEXT_PUBLIC_LIFF_ID is not set; skipping LIFF init");
        } else {
          await liff.init({ liffId });
          if (!liff.isLoggedIn()) {
            liff.login({ redirectUri: window.location.href });
            return;
          }
          const profile = await liff.getProfile();
          const ctx = liff.getContext?.();
          const decoded = liff.getDecodedIDToken?.();

          if (!cancelled) {
            setWelcomeName(profile.displayName ?? null);
            setLineUserId(decoded?.sub || ctx?.userId || profile?.userId || null);
            setLineGroupId(ctx?.groupId || ctx?.roomId || null); // keep last seen group/room for API payload
          }
        }
      } catch (err) {
        console.error("[LINE] Failed to initialize LIFF", err);
      } finally {
        if (cancelled) return;
        setShowLineWelcome(true);
        setTimeout(() => {
          if (!cancelled) setShowLineWelcome(false);
        }, 3200);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [resetFlow]);

  const submitAssessment = useCallback(
    async (payload: AssessmentPayload) => {
      setSubmissionState("saving");
      setSubmitError(null);

      try {
        const res = await fetch("/api/screenings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            lineUserId,
            lineGroupId,
          }),
        });

        if (!res.ok) {
          let message = `Request failed with status ${res.status}`;
          try {
            const data = await res.json();
            if (data?.error) message = data.error;
          } catch {
            // ignore parsing errors
          }
          throw new Error(message);
        }

        setSubmissionState("success");
      } catch (err) {
        console.error("Failed to submit assessment", err);
        setSubmissionState("error");
        setSubmitError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [lineGroupId, lineUserId]
  );

  // Logic: Gauge -> 2Q (if high stress) or Stay
  const handleGaugeNext = (level: number) => {
    setStressLevel(level);
    setSubmissionState("idle");
    setSubmitError(null);
    setTwoQResult(null);
    goTo2Q();
  };

  const handleTwoQResult = useCallback(
    (result: TwoQResult) => {
      setTwoQResult(result);
      if (!result.risk) {
        submitAssessment({
          stressLevel,
          twoQ: result,
          nineQScore: null,
          nineQSeverity: null,
          hasSuicideRisk: false,
        });
      }
    },
    [stressLevel, submitAssessment]
  );

  const handleNineQComplete = useCallback(
    (result: NineQResult) => {
      const twoQPayload = twoQResult ?? { q1: false, q2: false, risk: false };
      submitAssessment({
        stressLevel,
        twoQ: twoQPayload,
        nineQScore: result.score,
        nineQSeverity: result.severity,
        hasSuicideRisk: result.hasSuicideRisk,
      });
    },
    [stressLevel, twoQResult, submitAssessment]
  );

  return (
    <div className="h-[100dvh] bg-slate-100 flex items-center justify-center font-sans text-slate-800 p-0 md:p-4">
      {/* Mobile Frame Container */}
      <div className="w-full h-[100dvh] md:h-[800px] md:max-w-md bg-white md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header (Common) */}
        <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 z-20">
          {view !== "home" ? (
            <button onClick={goHome} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
              <ChevronLeft />
            </button>
          ) : (
            <div className="w-10"></div>
          )}

          <h1 className="font-bold text-slate-700">
            Check-jai <span className="text-blue-500">App</span>
          </h1>

          <button className="p-2 text-slate-400">
            <Info size={20} />
          </button>
        </div>

        {showLineWelcome && (
          <div className="absolute top-16 left-0 right-0 flex justify-center px-4 z-30">
            <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2">
              <Sun size={18} className="opacity-80" />
              <span>สวัสดี คุณ {welcomeName ?? "เพื่อน LINE"} • กำลังเริ่มต้นการประเมินให้คุณ</span>
            </div>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative bg-slate-50">
          {view === "home" && <StressGauge onNext={handleGaugeNext} welcomeName={welcomeName} autoStart={fromLineMiniApp} />}
          {view === "2q" && <TwoQPlus onNext={goTo9Q} onHome={goHome} onResult={handleTwoQResult} />}
          {view === "9q" && <NineQ onHome={goHome} onComplete={handleNineQComplete} />}
        </div>

        {submissionState !== "idle" && (
          <div className="absolute left-0 right-0 bottom-3 flex justify-center px-4">
            <div
              className={`px-3 py-2 text-xs rounded-lg shadow ${
                submissionState === "saving"
                  ? "bg-blue-50 text-blue-700"
                  : submissionState === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {submissionState === "saving" && "Saving assessment..."}
              {submissionState === "success" && "Saved to database and sent to LINE."}
              {submissionState === "error" && `Could not save: ${submitError ?? "unknown error"}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
