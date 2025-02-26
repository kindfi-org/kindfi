import {
  Cpu,
  GraduationCap,
  Leaf,
  Palette,
  Stethoscope,
  Users,
} from "lucide-react";
import type { ProjectCategory } from "../types/projects.types";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  {
    id: "environment",
    label: "Environment",
    value: "environment",
    icon: Leaf,
    description: "Environmental conservation and sustainability initiatives",
  },
  {
    id: "education",
    label: "Education",
    value: "education",
    icon: GraduationCap,
    description: "Learning, educational access, and development projects",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    value: "healthcare",
    icon: Stethoscope,
    description: "Medical, wellness, and health accessibility initiatives",
  },
  {
    id: "technology",
    label: "Technology",
    value: "technology",
    icon: Cpu,
    description: "Tech innovation and digital access projects",
  },
  {
    id: "community",
    label: "Community",
    value: "community",
    icon: Users,
    description: "Community building and social support initiatives",
  },
  {
    id: "arts",
    label: "Arts",
    value: "arts",
    icon: Palette,
    description: "Creative and cultural expression projects",
  },
] as const;
