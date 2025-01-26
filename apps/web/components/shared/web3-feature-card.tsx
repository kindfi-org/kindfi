import { motion } from 'framer-motion'

interface Web3FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  stats?: {
    value: string
    label: string
  }
  checkList?: { id: string; text: string }[]
}

export const Web3FeatureCard = ({
  title,
  description,
  icon,
  stats,
  checkList,
}: Web3FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 rounded-xl bg-teal-50">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>

    <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

    {stats && (
      <div className="bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-xl p-4 mb-4">
        <div className="text-2xl font-bold gradient-text mb-1">
          {stats.value}
        </div>
        <div className="text-sm gradient-text">{stats.label}</div>
      </div>
    )}

    {checkList && (
      <ul className="space-y-3">
        {checkList.map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {item.text}
          </li>
        ))}
      </ul>
    )}
  </motion.div>
)