import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

export const projectFormSchema = z.object({
  // Step 1
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(1, "Description is required"),

  // Step 2
  previousFunding: z
    .string()
    .min(1, "Previous funding amount is required")
    .refine((val) => !Number.isNaN(Number(val)), "Must be a valid number"),
  fundingGoal: z
    .string()
    .min(1, "Funding goal is required")
    .refine((val) => !Number.isNaN(Number(val)), "Must be a valid number"),
  currency: z.string().min(1, "Please select a currency"),
  image: z
    .any()
    .optional()
    .refine(
      (file) => !file || file?.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .gif formats are supported"
    ),

  // Step 3
  projectSupport: z
    .string()
    .min(20, "Must be at least 20 characters")
    .max(1000, "Must not exceed 1000 characters"),
  fundUsage: z
    .string()
    .min(20, "Must be at least 20 characters")
    .max(1000, "Must not exceed 1000 characters"),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

// Validation schemas for each step
export const step1Fields: (keyof ProjectFormData)[] = [
  "website",
  "location",
  "category",
  "description",
];

export const step2Fields: (keyof ProjectFormData)[] = [
  "previousFunding",
  "fundingGoal",
  "currency",
  "image",
];

export const step3Fields: (keyof ProjectFormData)[] = [
  "projectSupport",
  "fundUsage",
];
