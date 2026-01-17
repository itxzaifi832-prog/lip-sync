import PageTransition from '../components/layout/Transition';
import { Book, CheckCircle, Terminal, AlertTriangle } from 'lucide-react';

const Documentation = () => {
    return (
        <PageTransition>
            <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Book className="text-primary w-10 h-10" />
                    <h1 className="text-4xl font-bold">Documentation</h1>
                </div>

                <div className="space-y-12">
                    {/* Quick Start */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            Quick Start
                        </h2>
                        <div className="glass-card space-y-4">
                            <ol className="space-y-4">
                                {[
                                    "Prepare a clear, front-facing image of a person.",
                                    "Enter the text you want the person in the image to speak.",
                                    "Click \"Generate Video\" and wait for the processing to finish.",
                                    "Download your generated high-quality lip-sync video."
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <p className="text-zinc-300">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    {/* Technical Specs */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <div className="w-2 h-8 bg-secondary rounded-full" />
                            Technical Requirements
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="glass-card">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <CheckCircle className="text-green-500 w-4 h-4" />
                                    Recommended Specs
                                </h3>
                                <ul className="text-sm text-zinc-400 space-y-2">
                                    <li>CPU: Intel i5+ or AMD Ryzen 5+</li>
                                    <li>RAM: 16GB Minimum</li>
                                    <li>OS: Windows 10/11 or Linux</li>
                                    <li>Python: 3.10.x</li>
                                </ul>
                            </div>
                            <div className="glass-card border-yellow-500/10">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <AlertTriangle className="text-yellow-500 w-4 h-4" />
                                    Limitations
                                </h3>
                                <ul className="text-sm text-zinc-400 space-y-2">
                                    <li>Maximum 1000 characters per clip</li>
                                    <li>Single face detection only</li>
                                    <li>Portrait images work best</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* API Information */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <div className="w-2 h-8 bg-accent rounded-full" />
                            Developer API
                        </h2>
                        <div className="glass-card bg-black/40">
                            <div className="flex items-center gap-2 text-zinc-300 mb-4 px-3 py-1.5 bg-white/5 rounded-lg w-fit">
                                <Terminal className="w-4 h-4" />
                                <code className="text-sm font-mono">POST /api/generate</code>
                            </div>
                            <pre className="text-xs font-mono text-zinc-400 bg-black/30 p-4 rounded-xl overflow-x-auto border border-white/5">
                                {`{
  "text": "The message to speak",
  "image": "Multipart file upload (face.jpg)",
  "options": {
    "restoration": true,
    "quality": "high"
  }
}`}
                            </pre>
                        </div>
                    </section>
                </div>
            </div>
        </PageTransition>
    );
};

export default Documentation;
