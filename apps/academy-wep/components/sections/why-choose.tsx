import { IoBookOutline, IoShieldOutline, IoPeopleOutline } from 'react-icons/io5'
import { FeatureCard } from './feature-card'
import { useEffect, useState } from 'react'

const FeaturesOverview: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      threshold: 0.1,
    });
    const container = document.getElementById("features-container");
    if (container) {
      observer.observe(container);
    }
    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, []);

  return (
    <div className="bg-slate-150 py-16 px-4 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-gray-700 font-medium mb-4">
            Why Choose KindFi Academy
          </h2>
          <h1 className="text-4xl font-bold mb-4">
            Learn Skills That Drive{' '}
            <span className="text-green-600">Real Impact</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our curriculum is designed specifically for social impact projects,
            combining technical knowledge with practical applications.
          </p>
        </div>
        <div id="features-container" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '0ms' }}>
            <FeatureCard
              icon={<IoBookOutline size={32} className="text-green-500" />}
              title="Interactive"
              titleHighlight="Curriculum"
              titleColor="green"
              description="Learn blockchain fundamentals through hands-on exercises, interactive simulations, and real-world Stellar blockchain examples."
              ctaText="Explore Curriculum"
              ctaLink="#"
            />
          </div>
          <div className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '150ms' }}>
            <FeatureCard
              icon={<IoShieldOutline size={32} className="text-blue-500" />}
              title="Stellar NFT"
              titleHighlight="Badges"
              titleColor="blue"
              description="Earn verifiable credentials on the Stellar blockchain as you complete modules, showcasing your expertise with immutable proof."
              ctaText="View Badge Gallery"
              ctaLink="#"
            />
          </div>
          <div className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
            <FeatureCard
              icon={<IoPeopleOutline size={32} className="text-purple-500" />}
              title="Impact"
              titleHighlight="Community"
              titleColor="purple"
              description="Connect with a global network of changemakers using Stellar blockchain technology to drive social and environmental impact projects."
              ctaText="Join Our Community"
              ctaLink="#"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesOverview