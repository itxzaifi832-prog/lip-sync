import { motion } from 'framer-motion';
import PageTransition from '../components/layout/Transition';
import { Cpu, Users, Eye, Code } from 'lucide-react';

const About = () => {
    return (
        <PageTransition>
            <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">About <span className="gradient-text">Antigravity AI</span></h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        A state-of-the-art lip-sync generation platform built for creators, researchers, and developers.
                    </p>
                </div>

                <div className="space-y-16">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">The Mission</h2>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                Our mission is to democratize high-fidelity AI animation technologies. We believe that everyone should have access to powerful tools that can bridge the gap between static content and dynamic storytelling.
                            </p>
                            <p className="text-zinc-400 leading-relaxed">
                                By optimizing complex neural networks for local performance, we ensure that creativity is not limited by cloud computing costs or privacy concerns.
                            </p>
                        </div>
                        <div className="glass-card aspect-square flex items-center justify-center">
                            <Eye className="w-32 h-32 text-primary opacity-20 animate-pulse-slow" />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-8 text-center">Core Technologies</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Cpu,
                                    title: "Wav2Lip",
                                    desc: "A powerful GAN-based model for accurately syncing lip movements with any audio."
                                },
                                {
                                    icon: Eye,
                                    title: "GFPGAN",
                                    desc: "State-of-the-art face restoration to ensure generated faces are sharp and realistic."
                                },
                                {
                                    icon: Code,
                                    title: "FastAPI",
                                    desc: "High-performance Python backend for seamless model inference and API delivery."
                                }
                            ].map((tech, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="glass-card"
                                >
                                    <tech.icon className="w-8 h-8 text-primary mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">{tech.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{tech.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section className="text-center glass rounded-3xl p-12">
                        <Users className="w-12 h-12 text-primary mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-4">The Development Team</h2>
                        <p className="text-zinc-400 max-w-xl mx-auto">
                            Built with passion by the Advanced Agentic Coding team, pushing the boundaries of what's possible with AI-assisted software engineering.
                        </p>
                    </section>
                </div>
            </div>
        </PageTransition>
    );
};

export default About;
