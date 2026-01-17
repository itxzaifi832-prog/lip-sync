import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/layout/Transition';

const Dashboard = () => {
    return (
        <PageTransition>
            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/5 text-sm font-medium text-primary mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Next-Gen Lip Sync Technology</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                        Bring Your Images <br />
                        <span className="gradient-text">To Life</span>
                    </h1>

                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        A powerful AI-driven platform to generate realistic lip-sync videos from static images and text. High quality, low latency, and completely private.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/lip-sync" className="btn-primary flex items-center gap-2 group">
                            Start Generating
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/docs" className="px-6 py-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-all text-zinc-300">
                            Read Documentation
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {[
                        {
                            icon: Zap,
                            title: "Lightning Fast",
                            desc: "Optimized processing pipeline ensures your videos are ready in seconds, not minutes."
                        },
                        {
                            icon: Sparkles,
                            title: "High Quality",
                            desc: "Powered by GFPGAN for face restoration, delivering sharp and clear results every time."
                        },
                        {
                            icon: Shield,
                            title: "Privacy First",
                            desc: "All processing happens on your local machine. Your data never leaves your environment."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card flex flex-col items-start gap-4"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <feature.icon className="text-primary w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section / Decorative */}
                <div className="glass rounded-3xl p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -ml-32 -mb-32" />

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Why choose Antigravity?</h2>
                            <p className="text-zinc-400 mb-6">
                                Our platform leverages the latest advancements in Wav2Lip and face restoration techniques to provide a seamless and high-fidelity experience. Whether it's for digital avatars, educational content, or memes, we've got you covered.
                            </p>
                            <ul className="space-y-4">
                                {['Accurate Phoneme Mapping', 'Stable Face Detection', 'Seamless Audio Integration'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-5 h-5 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="aspect-video glass rounded-2xl border-white/5 flex items-center justify-center">
                            {/* Replace with a demo video or attractive image later */}
                            <div className="text-zinc-500 flex flex-col items-center gap-2">
                                <Video className="w-12 h-12 opacity-20" />
                                <span>Demo Preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Dashboard;
