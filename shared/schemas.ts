import { z } from "zod";

export const createFlashcardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "플래시카드 제목은 필수입니다")
    .max(20, "플래시카드 제목은 최대 20자입니다"),
  cards: z
    .array(
      z.object({
        front: z
          .string()
          .trim()
          .min(1, "카드 앞면은 필수입니다")
          .max(50, "카드 앞면은 최대 50자입니다"),
        back: z
          .string()
          .trim()
          .min(1, "카드 뒷면은 필수입니다")
          .max(100, "카드 뒷면은 최대 100자입니다"),
      })
    )
    .min(1, "최소 하나의 카드는 필요합니다")
    .max(5000, "최대 5000개의 카드를 추가할 수 있습니다")
    .refine(
      (cards) => cards.every((card) => card.front.trim().length > 0),
      "모든 카드의 앞면을 채워주세요."
    )
    .refine((cards) => {
      const trimmedFronts = cards.map((card) => card.front.trim());
      const uniqueFronts = new Set(trimmedFronts);
      return uniqueFronts.size === trimmedFronts.length;
    }, "중복된 카드 앞면이 있습니다. 각 카드 앞면은 고유해야 합니다."),
});
