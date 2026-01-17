import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Home, Video, Info, FileText } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const links = [
        { name: 'Dashboard', path: '/', icon: Home },
        { name: 'Lip-Sync', path: '/lip-sync', icon: Video },
        { name: 'About', path: '/about', icon: Info },
        { name: 'Docs', path: '/docs', icon: FileText },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 flex items-center px-6 md:px-12 justify-between">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <BrainCircuit className="text-primary w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight gradient-text">Lip-Sync</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-2 transition-all duration-300 ${location.pathname === link.path
                            ? 'text-white font-semibold'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <link.icon className="w-4 h-4" />
                        <span>{link.name}</span>

                    </Link>
                ))}
            </div>

            <button className="md:hidden text-zinc-400">
                {/* Mobile menu toggle would go here */}
            </button>
        </nav>
    );
};

export default Navbar;
