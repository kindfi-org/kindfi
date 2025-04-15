'use client'

import { motion } from 'framer-motion'
import { Icon } from '~/components/base/icon'
import { useMemo } from 'react'

interface FloatingFeatureProps {
  icon: string
  title: string
  variant?: 'green' | 'blue' | 'indigo' | 'purple'
  className?: string
}

/**
 * FloatingFeature - A responsive floating feature component with an icon and title.
 *
 * @component
 * @param {FloatingFeatureProps} props - The component props.
 * @param {string} props.icon - Icon name from the available icons.
 * @param {string} props.title - The title of the feature.
 * @param {string} [props.variant='green'] - Color variant for the icon background.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @returns {JSX.Element} The rendered FloatingFeature component.
 */
const FloatingFeature = ({ 
  icon, 
  title, 
  variant = 'blue',
  className = '' 
}: FloatingFeatureProps) => {
  // Color schemes based on variant
  const colorScheme = useMemo(() => {
    const schemes = {
      green: {
        iconBg: 'bg-gradient-to-br from-green-400 to-green-500',
        iconText: 'text-white',
        hover: 'hover:shadow-green-200/60',
        ring: 'group-hover:ring-green-200'
      },
      blue: {
        iconBg: 'bg-gradient-to-br from-blue-900 to-green-500',
        iconText: 'text-white',
        hover: 'hover:shadow-blue-200/60',
        ring: 'group-hover:ring-blue-200'
      },
      indigo: {
        iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
        iconText: 'text-white',
        hover: 'hover:shadow-indigo-200/60',
        ring: 'group-hover:ring-indigo-200'
      },
      purple: {
        iconBg: 'bg-gradient-to-br from-purple-400 to-purple-500',
        iconText: 'text-white',
        hover: 'hover:shadow-purple-200/60',
        ring: 'group-hover:ring-purple-200'
      }
    }
    return schemes[variant]
  }, [variant])

  // Animation variants
  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring',
        damping: 15,
        stiffness: 300
      } 
    }
  }

  return (
    <motion.div
      variants={featureVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      whileHover={{ 
        y: -5,
        transition: { 
          type: 'spring', 
          stiffness: 400 
        }
      }}
      className={`group flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full 
                shadow-md ${colorScheme.hover} hover:shadow-lg border border-gray-100
                transition-all duration-300 w-full max-w-sm mx-auto ${className}`}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 ${colorScheme.iconBg} ${colorScheme.iconText} 
                   rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110
                   ring-2 ring-transparent ${colorScheme.ring} transition-all`}
      >
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <span className="text-base font-medium text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
        {title}
      </span>
    </motion.div>
  )
}

export { FloatingFeature }