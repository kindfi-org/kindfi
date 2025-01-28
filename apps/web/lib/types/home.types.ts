export interface Category {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

export interface Tag {
  id: string;
  text: string;
}

export interface JourneyStep {
  number: number;
  title: string;
  description: string;
  active: boolean;
  icon: React.ReactNode;
}

export interface Project {
  id: string;
  image: string;
  category: string;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  investors: number;
  minInvestment: number;
  percentageComplete: number;
  tags: Tag[];
}

export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
  stats?: {
    value: string;
    label: string;
  };
  checkList?: {
    id: string;
    text: string;
  }[];
}

export enum ModelVariant {
  SECURE = 'secure',
  SOCIAL = 'social',
  BLOCKCHAIN = 'blockchain'
}

export interface Benefit {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

export interface Model {
  id: string;
  title: string;
  description: string;
  variant: ModelVariant;
  icon: React.ReactNode;
  benefits: Benefit[];
}

export enum StepNumber {
  EXPLORE = 1,
  DISCOVER = 2,
  SUPPORT = 3,
}

export interface GuideStep {
  stepNumber: StepNumber;
  title: string;
  description: string;
  Icon: React.ComponentType;
  imageAlt: string;
}

export interface TestimonialData {
  quote: string;
  author: string;
  role: string;
  imageUrl: string;
}

export interface SocialButtonProps {
  id: string;
  icon: React.ReactNode;
  provider: string;
  onClick: () => void;
  className: string;
}
