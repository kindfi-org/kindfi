import { motion } from "framer-motion";
import Icon from "~/components/base/icon";

interface FloatingFeatureProps {
  icon: string;
  title: string;
}

const featureVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FloatingFeature: React.FC<FloatingFeatureProps> = ({ icon, title }) => {
  return (
    <motion.div
      variants={featureVariants}
      whileHover={{ scale: 1.1 }}
      className="flex items-center space-x-4 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200"
    >
      <div className="flex items-center justify-center w-10 h-10 bg-green-300 text-white rounded-full">
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <span className="text-lg font-medium text-gray-900">{title}</span>
    </motion.div>
  );
};

export default FloatingFeature;
