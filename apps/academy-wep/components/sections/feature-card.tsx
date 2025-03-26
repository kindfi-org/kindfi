import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type React from 'react'
import { useRef, useState, useEffect } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import type { ThemeColor } from '../../../web/lib/constants/theme-color.contants'
import { colorMap } from '../../../web/lib/constants/theme-color.contants'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  titleHighlight: string
  titleColor: ThemeColor
  description: string
  ctaText: string
  ctaLink: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  titleHighlight,
  titleColor,
  description,
  ctaText,
  ctaLink,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const defaultPosition = { x: 0.5, y: 0.25 }
  const [position, setPosition] = useState(defaultPosition)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReducedMotion) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    if (isHovering) {
      setPosition({ x, y })
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setPosition(defaultPosition)
  }

  return (
    <Card
      ref={cardRef}
      className="relative overflow-hidden bg-white rounded-xl shadow-lg transition-all duration-300 h-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsHovering(true)}
      onBlur={() => {
        setIsHovering(false)
        setPosition(defaultPosition)
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          opacity: isHovering ? 0.3 : 0.15,
          background: prefersReducedMotion
            ? `radial-gradient(220px circle at 50% 50%, rgba(${colorMap[titleColor].rgb}, 1), transparent 70%)`
            : `radial-gradient(220px circle at ${position.x * 100}% ${position.y * 100}%, rgba(${colorMap[titleColor].rgb}, 1), transparent 70%)`,
          backgroundImage: `-webkit-radial-gradient(circle, rgba(${colorMap[titleColor].rgb}, 1), transparent 70%)`,
        }}
      />
      <CardHeader className="flex items-center justify-center pt-8 pb-2 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: colorMap[titleColor].iconBg,
              }}
            >
              <div
                style={{
                  color: colorMap[titleColor].iconColor,
                }}
              >
                {icon}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-center px-6 relative z-10">
        <h3 className="text-2xl font-semibold mb-3">
          <span className="text-gray-800">{title} </span>
          <span className={colorMap[titleColor].text}>{titleHighlight}</span>
        </h3>
        <p className="text-gray-600 mb-6">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-center pb-8 relative z-10">
        <Button
          variant="ghost"
          className={`group ${colorMap[titleColor].text} ${colorMap[titleColor].hover}`}
          asChild
        >
          <a href={ctaLink} aria-label={`${ctaText} for ${title} ${titleHighlight}`}>
            {ctaText}
            <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}