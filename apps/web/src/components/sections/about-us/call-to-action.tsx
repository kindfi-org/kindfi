'use client';

import { Button } from '@/components/ui/button';

export function CallToAction() {
  return (
    <section className="bg-primary-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join KindFi today and be part of the future of decentralized finance.
          </p>
          <Button size="lg">Get Started Now</Button>
        </div>
      </div>
    </section>
  );
} 