// src/pages/public/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  Play,
  ChevronDown,
  Flame,
  Globe,
  Zap
} from 'lucide-react';

// Particle Background Component
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    }));
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${particle.opacity})`;
        ctx.fill();
      });
      
      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.1 * (1 - distance / 150)})`;
            ctx.stroke();
          }
        });
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

// Animated Counter
const AnimatedCounter = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const increment = end / (duration * 60);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 1000 / 60);
        observer.disconnect();
      }
    });
    
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration]);
  
  return <span ref={countRef}>{count.toLocaleString()}{suffix}</span>;
};

// Glass Card Component
const GlassCard = ({ children, className = "", hover = true }) => (
  <div className={`
    relative overflow-hidden
    bg-slate-900/40 backdrop-blur-xl 
    border border-white/10 
    rounded-3xl
    ${hover ? 'hover:border-purple-500/50 hover:bg-slate-900/60 transition-all duration-500 group' : ''}
    ${className}
  `}>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">{children}</div>
  </div>
);

// Feature Card with 3D Tilt
const FeatureCard = ({ feature, index, isActive, onHover }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setTransform({
      rotateX: ((y - centerY) / centerY) * -10,
      rotateY: ((x - centerX) / centerX) * 10
    });
  };
  
  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    onHover(null);
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      className={`
        relative p-8 rounded-3xl cursor-pointer
        ${isActive ? 'bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border-purple-500/50' : 'bg-slate-900/40 border-white/10'}
        border backdrop-blur-xl
        transition-all duration-300
        hover:shadow-[0_0_40px_rgba(147,51,234,0.3)]
      `}
    >
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6
        bg-gradient-to-br ${feature.gradient} 
        shadow-lg transform group-hover:scale-110 transition-transform duration-300
      `}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
      <p className="text-slate-400 leading-relaxed">{feature.description}</p>
      
      {/* Glow Effect */}
      <div className={`
        absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl
        bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500
        ${isActive ? 'opacity-30' : ''}
      `} />
    </motion.div>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const features = [
    {
      icon: <Users className="text-white" />,
      title: "Youth Circles",
      description: "Join small groups of like-minded believers. Share struggles, celebrate victories, and grow together.",
      gradient: "from-pink-500 to-rose-500",
      color: "#ec4899"
    },
    {
      icon: <BookOpen className="text-white" />,
      title: "Bible Study",
      description: "Interactive scripture reading with daily devotionals, verse memorization tools, and study guides.",
      gradient: "from-blue-500 to-cyan-500",
      color: "#3b82f6"
    },
    {
      icon: <Heart className="text-white" />,
      title: "Prayer Wall",
      description: "A living wall of prayers. Request intercession, pray for others, and witness miracles unfold.",
      gradient: "from-purple-500 to-violet-500",
      color: "#8b5cf6"
    },
    {
      icon: <MessageCircle className="text-white" />,
      title: "Safe Community",
      description: "Moderated discussions in a judgment-free zone. Your voice matters here.",
      gradient: "from-amber-500 to-orange-500",
      color: "#f59e0b"
    }
  ];
  
  const stats = [
    { value: 12000, label: "Youth Connected", suffix: "+" },
    { value: 850, label: "Active Groups", suffix: "" },
    { value: 50000, label: "Prayers Shared", suffix: "+" },
    { value: 47, label: "Counties Reached", suffix: "" }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/20 rounded-full blur-[96px] animate-pulse delay-2000" />
      </div>
      
      <ParticleBackground />
      
      {/* Navigation */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-lg opacity-50" />
              <span className="relative text-3xl">✝️</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              IMANI HUB
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Community', 'Testimonials', 'About'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-300">Join 12,000+ youth across Kenya</span>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Faith
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              Connected
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            A digital sanctuary where Kenyan youth gather to worship, connect, and grow in Christ. 
            Your journey to authentic community starts here.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-lg font-bold text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-3"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="group px-8 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/5 transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play className="w-4 h-4 fill-current" />
              </div>
              Watch Stories
            </motion.button>
          </motion.div>
          
          {/* Stats Bar */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {stats.map((stat, idx) => (
              <GlassCard key={idx} className="p-4 text-center" hover={false}>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </GlassCard>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-slate-500" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              Why Join Us
            </span>
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Built for Youth, <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Powered by Faith
              </span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index}
                isActive={activeFeature === index}
                onHover={setActiveFeature}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Prayer</span>,<br />
                Touch a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Soul</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Our Prayer Wall is more than a feature—it's a living testimony of God's work in our community. 
                Every prayer shared is a seed of hope planted in Kenyan soil.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Flame className="w-5 h-5 text-orange-400" />, text: "Anonymous prayer requests" },
                  { icon: <Globe className="w-5 h-5 text-cyan-400" />, text: "Pray for believers across all 47 counties" },
                  { icon: <Zap className="w-5 h-5 text-yellow-400" />, text: "Instant notifications when someone prays for you" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-slate-300 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-white">Sarah from Nairobi</div>
                    <div className="text-xs text-slate-500">2 hours ago</div>
                  </div>
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  "Please pray for my upcoming exams. I've been struggling with anxiety but I know that God is with me through this season. 🙏"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Heart className="w-4 h-4 text-pink-500 fill-current" />
                    <span>24 people prayed</span>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-colors">
                    Pray Now
                  </button>
                </div>
              </GlassCard>
              
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-cyan-500/30 to-transparent rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Stories of <span className="text-purple-400">Transformation</span></h2>
          </motion.div>
          
          <GlassCard className="p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
            <div className="text-6xl font-serif text-purple-500/20 absolute top-8 left-8">"</div>
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8 italic">
                Imani Hub didn't just give me friends—it gave me a family. During my darkest moments, 
                this community held me up in prayer. Today, I'm leading a youth group in Mombasa because 
                someone here believed in me first.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                    👤
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Brian Ochieng</div>
                  <div className="text-sm text-slate-500">Youth Leader, Mombasa</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 blur-3xl" />
            <GlassCard className="p-12 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
              
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 right-0 w-32 h-32 opacity-20"
                >
                  <Sparkles className="w-full h-full text-purple-400" />
                </motion.div>
                
                <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Ready to Begin?
                </h2>
                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
                  Join the movement of young believers reshaping Kenya's spiritual landscape. 
                  Your story starts with a single step of faith.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={() => navigate('/register')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-lg font-bold text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                  >
                    Create Free Account
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-10 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
                  >
                    Contact Support
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✝️</span>
                <span className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Imani Hub
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Building a stronger, more connected youth community across Kenya through faith and technology.
              </p>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Community Feed", "Prayer Wall", "Bible Study", "Events"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Press"]
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Guidelines", "Cookies"]
              }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-white mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href="#" className="text-slate-500 hover:text-purple-400 transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-600 text-sm">
              © 2026 Imani Hub. All rights reserved.
            </div>
            <div className="flex gap-6">
              {['Twitter', 'Instagram', 'YouTube'].map((social) => (
                <a key={social} href="#" className="text-slate-500 hover:text-white transition-colors text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;