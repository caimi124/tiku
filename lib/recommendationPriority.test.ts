import { calculateRecommendationPriority } from "./recommendationPriority";

describe("recommendation priority weighting", () => {
  test("chapter 9 mechanism outranks chapter 13 dosage with same base score", () => {
    const baseScore = 0.6;
    const highPriority = calculateRecommendationPriority(baseScore, 9, "mechanism");
    const lowPriority = calculateRecommendationPriority(baseScore, 13, "dosage");

    expect(highPriority.priority).toBeGreaterThan(lowPriority.priority);
    expect(highPriority.chapterWeight).toBeGreaterThanOrEqual(lowPriority.chapterWeight ?? 0);
  });
});

