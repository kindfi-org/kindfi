import { LucideIcon } from "lucide-react";

import { Shield, Bolt } from "lucide-react"; // Importing Lucide icons

interface IconProps {
  name: string;
  className?: string;
}

const Icon = ({ name, className }: IconProps) => {
  const icons: { [key: string]: LucideIcon } = {
    shield: Shield,
    bolt: Bolt,
    // Add more icons as needed
  };

  const IconComponent = icons[name];

  return IconComponent ? <IconComponent className={className} /> : null;
};

export { Icon };
