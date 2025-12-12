import {
  calculateRisk,
  HIGH_ACTION,
  MEDIUM_ACTION,
  LOW_ACTION,
  NONE_ACTION
} from "../riskCalculator";

describe("calculateRisk", () => {
  it("returns none when no risk factors", () => {
    const r = calculateRisk({
      stressScore: 2,
      q1: 0,
      q2: 0,
      q3: 0,
      eightQAnswers: [0, 0, 0, 0, 0, 0, 0, 0]
    });
    expect(r.riskLevel).toBe("none");
    expect(r.recommendation).toBe(NONE_ACTION);
  });

  it("returns low when q1 = 1", () => {
    const r = calculateRisk({
      stressScore: 2,
      q1: 1,
      q2: 0,
      q3: 0,
      eightQAnswers: [0, 0, 0, 0, 0, 0, 0, 0]
    });
    expect(r.riskLevel).toBe("low");
    expect(r.recommendation).toBe(LOW_ACTION);
  });

  it("returns high when q3 = 1 and emergency", () => {
    const r = calculateRisk({
      stressScore: 3,
      q1: 0,
      q2: 0,
      q3: 1,
      eightQAnswers: [0, 0, 0, 0, 0, 0, 1, 0] // ข้อ 7 = yes
    });
    expect(r.riskLevel).toBe("high");
    expect(r.recommendation).toBe(HIGH_ACTION);
  });

  it("returns medium when q3 = 1 and total8 >= 2", () => {
    const r = calculateRisk({
      stressScore: 3,
      q1: 0,
      q2: 0,
      q3: 1,
      eightQAnswers: [1, 1, 0, 0, 0, 0, 0, 0]
    });
    expect(r.riskLevel).toBe("medium");
    expect(r.recommendation).toBe(MEDIUM_ACTION);
  });

  it("returns low when q3 = 1 and total8 < 2", () => {
    const r = calculateRisk({
      stressScore: 3,
      q1: 0,
      q2: 0,
      q3: 1,
      eightQAnswers: [1, 0, 0, 0, 0, 0, 0, 0]
    });
    expect(r.riskLevel).toBe("low");
    expect(r.recommendation).toBe(LOW_ACTION);
  });
});
