import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import LipSync from './pages/LipSync';
import About from './pages/About';
import Documentation from './pages/Documentation';

// Simple Footer Component
const Footer = () => (
    <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
                <span className="font-bold text-lg gradient-text">Lip-Sync</span>
                <p className="text-zinc-500 text-sm">Next-gen lip-sync generation powered by AI.</p>
            </div>
            <div className="flex gap-8 text-sm text-zinc-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-zinc-500 text-sm">
                © 2026 Lip-Sync. All rights reserved.
            </div>
        </div>
    </footer>
);

function App() {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
            <Navbar />

            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/lip-sync" element={<LipSync />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/docs" element={<Documentation />} />
                    </Routes>
                </AnimatePresence>
            </main>

            <Footer />

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>
        </div>
    );
}

export default App;
