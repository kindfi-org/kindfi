'use client';

export function HowItWorks() {
  const steps = [
    {
      title: 'Create an Account',
      description: 'Sign up in minutes with our simple verification process.',
    },
    {
      title: 'Connect Your Wallet',
      description: 'Link your Stellar wallet securely to your KindFi account.',
    },
    {
      title: 'Start Transacting',
      description: 'Send, receive, and manage your assets with ease.',
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How KindFi Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 