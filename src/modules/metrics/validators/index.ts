import { z } from "zod";

export const bloodDonationMetricSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  campDonors: z.number().int().min(0),
  regularDonors: z.number().int().min(0),
  totalDonors: z.number().int().min(0).optional(),
});

export type BloodDonationMetricInput = z.infer<typeof bloodDonationMetricSchema>;
