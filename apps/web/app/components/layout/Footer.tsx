import * as React from "react";
import { useNavigate } from "react-router";
import { Logo } from "~/components/ui/logo";

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="w-full mt-20 pt-16 pb-8 border-t border-white/5 relative z-20 bg-black/20">
            <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12 md:gap-8">

                {/* Brand Column */}
                <div className="flex flex-col gap-4 max-w-sm">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" className="w-8 h-8 opacity-80" />
                        <span className="text-white font-bold tracking-tight">SuperQuran Graph</span>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed">
                        The knowledge graph for Quran AI. Building the infrastructure to explore the profound connections within the Quranic tradition.
                    </p>
                </div>

                {/* Links Columns */}
                <div className="flex gap-16">
                    {/* Product */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-medium text-sm">Product</h4>
                        <div className="flex flex-col gap-3 text-sm text-white/50">
                            <button onClick={() => navigate('/data-explorer')} className="text-left hover:text-white transition-colors">Data Explorer</button>
                            <button onClick={() => navigate('/read')} className="text-left hover:text-white transition-colors">Read Quran</button>
                            <a href="https://quran-web.qalam.workers.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Older Iteration</a>
                        </div>
                    </div>

                    {/* Writing */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-medium text-sm">Writing</h4>
                        <div className="flex flex-col gap-3 text-sm text-white/50">
                            <button onClick={() => navigate('/vision')} className="text-left hover:text-white transition-colors">The Journey</button>
                            <button onClick={() => navigate('/why-knowledge-graph')} className="text-left hover:text-white transition-colors">Why a Knowledge Graph</button>
                        </div>
                    </div>

                    {/* Contact & Legal */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-medium text-sm">Connect</h4>
                        <div className="flex flex-col gap-3 text-sm text-white/50">
                            <a
                                href="https://github.com/muhajirdev/quran-labs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                GitHub (Open Source)
                            </a>
                            <a href="mailto:muhammad@muhajir.dev" className="hover:text-white transition-colors">Email</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
                <p>© {new Date().getFullYear()} SuperQuran Graph. All rights reserved.</p>
                <p>Built for the Ummah</p>
            </div>
        </footer>
    );
};
