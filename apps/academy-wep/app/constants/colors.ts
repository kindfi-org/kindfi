/**
 * Theme colors organized by category for consistent styling across the application
 */
type ColorCategory = Record<string, string>;

export const THEME_COLORS: Record<string, ColorCategory> = {
  blockchain: {
    verified: "text-secondary",
    primary: "text-green-500",
  },
  security: {
    tamperProof: "text-blue-600",
    shield: "text-blue-700",
  },
  industry: {
    recognized: "text-violet-600",
    users: "text-violet-500",
  },
};
