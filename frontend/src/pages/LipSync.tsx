import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, AlertCircle, Download, RefreshCcw } from 'lucide-react';
import PageTransition from '../components/layout/Transition';
import { generateLipSync } from '../services/api';

const LipSync = () => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File too large (max 5MB)");
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text || !image) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const blob = await generateLipSync(text, image);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        } catch (err) {
            console.error(err);
            setError("Failed to generate lip-sync video. Check backend logs.");
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setVideoUrl(null);
        setError(null);
        setText('');
        setImage(null);
        setPreview(null);
    };

    return (
        <PageTransition>
            <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Generate <span className="gradient-text">Lip-Sync</span></h1>
                    <p className="text-zinc-400">Upload a face image and provide the text to generate a realistic video.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Input Side */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Text to Speak</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Hello, welcome to Antigravity AI..."
                                    className="input-field min-h-[120px] resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Face Image</label>
                                <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center gap-3 ${preview ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20'
                                    }`}>
                                    {preview ? (
                                        <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border border-white/10">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            {!isLoading && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setImage(null); setPreview(null); }}
                                                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-black/70 transition-colors"
                                                >
                                                    <RefreshCcw className="w-4 h-4 text-white" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                                <Upload className="text-zinc-400 w-6 h-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-zinc-300 font-medium">Click to upload photo</p>
                                                <p className="text-xs text-zinc-500 mt-1">PNG, JPG (max 5MB)</p>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full flex items-center justify-center gap-2 group"
                                disabled={isLoading || !text || !image}
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-5 h-5" />
                                        Generate Video
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Result Side */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card aspect-video flex flex-col items-center justify-center text-center gap-4"
                                >
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-1">Generating Magic</h3>
                                        <p className="text-zinc-400 text-sm">This usually takes 20-40 seconds...</p>
                                    </div>
                                </motion.div>
                            )}

                            {videoUrl && !isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card space-y-4"
                                >
                                    <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5 relative group">
                                        <video
                                            controls
                                            src={videoUrl}
                                            className="w-full h-full object-contain"
                                            autoPlay
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <a
                                            href={videoUrl}
                                            download="lipsync.mp4"
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-zinc-300 font-medium"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </a>
                                        <button
                                            onClick={reset}
                                            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-zinc-400"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-start"
                                >
                                    <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-red-500 font-semibold text-sm">Generation Error</h4>
                                        <p className="text-red-400/80 text-xs mt-1">{error}</p>
                                    </div>
                                </motion.div>
                            )}

                            {!isLoading && !videoUrl && !error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-card aspect-video flex flex-col items-center justify-center text-center opacity-30 border-dashed"
                                >
                                    <Video className="w-12 h-12 mb-4" />
                                    <p>Generated result will appear here</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default LipSync;
