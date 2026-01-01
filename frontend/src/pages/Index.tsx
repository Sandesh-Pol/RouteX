import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/auth/AuthContext';
import { useEffect } from 'react';

export default function Index() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'client' 
        ? '/client' 
        : user.role === 'driver' 
          ? '/driver' 
          : '/admin';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-sidebar overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-info/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <i className="fas fa-truck-fast text-accent-foreground text-lg"></i>
          </div>
          <span className="text-xl font-bold text-primary-foreground">ParcelFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="px-6 py-2.5 rounded-lg bg-primary-foreground/10 text-primary-foreground font-medium hover:bg-primary-foreground/20 transition-colors backdrop-blur-sm"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="hidden sm:block px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 lg:px-12 py-12 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-8 backdrop-blur-sm">
              <i className="fas fa-bolt"></i>
              <span className="text-sm font-medium">Lightning Fast Deliveries</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              Smart Logistics
              <br />
              <span className="text-accent">Made Simple</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
              Track, manage, and deliver parcels with real-time visibility. 
              Connect clients, drivers, and operations in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-all hover:shadow-glow flex items-center justify-center gap-2"
              >
                <span>Start Shipping</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-primary-foreground/20 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-play-circle"></i>
                <span>See How It Works</span>
              </a>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            id="features"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-24 grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: 'fa-location-crosshairs',
                title: 'Live Tracking',
                description: 'Real-time GPS tracking for all shipments with instant updates',
              },
              {
                icon: 'fa-shield-check',
                title: 'Secure Delivery',
                description: 'End-to-end visibility with proof of delivery and notifications',
              },
              {
                icon: 'fa-chart-line',
                title: 'Smart Analytics',
                description: 'Insights and reports to optimize your logistics operations',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 text-left hover:bg-primary-foreground/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <i className={`fas ${feature.icon} text-accent text-xl`}></i>
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary-foreground/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Role Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-primary-foreground mb-8">
              Built for Everyone
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  role: 'Clients',
                  icon: 'fa-user',
                  features: ['Send parcels easily', 'Track in real-time', 'Get instant notifications'],
                },
                {
                  role: 'Drivers',
                  icon: 'fa-truck',
                  features: ['Manage assignments', 'Navigate efficiently', 'Update delivery status'],
                },
                {
                  role: 'Admins',
                  icon: 'fa-user-shield',
                  features: ['Oversee operations', 'Assign drivers', 'Monitor fleet live'],
                },
              ].map((item) => (
                <div
                  key={item.role}
                  className="p-6 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                    <i className={`fas ${item.icon} text-accent-foreground text-xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-primary-foreground mb-4">{item.role}</h3>
                  <ul className="space-y-2">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                        <i className="fas fa-check text-accent text-xs"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-primary-foreground/50 text-sm">
        <p>© 2024 ParcelFlow. Smart Logistics Management.</p>
      </footer>
    </div>
  );
}
