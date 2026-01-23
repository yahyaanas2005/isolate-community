import Link from "next/link";
import { ArrowRight, Building2, Briefcase, Gamepad2, ShieldCheck, Globe, Users } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-teal-900/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">
                        I
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        ISOLATE
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/login?mode=signup"
                        className="group px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-white/5"
                    >
                        Join Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-8 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        Platform V2.0 is Live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                        One Identity. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400">
                            Infinite Communities.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        The universal platform for modern communities. From residential complexes to professional networks and gaming guilds—manage it all with a single profile.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login?mode=signup"
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                        >
                            Get Your Global ID
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="#explore"
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all active:scale-95 backdrop-blur-sm"
                        >
                            Explore Features
                        </Link>
                    </div>
                </div>

                {/* 3 Pillars */}
                <div id="explore" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">

                    {/* Physical Card */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:bg-white/[0.07] overflow-hidden text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Physical</h3>
                            <p className="text-white/50 leading-relaxed mb-6">
                                Residential complexes, HOAs, and gated communities. Manage units, visitors, and facility bookings seamlessly.
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-400" /> Gatekeeper System</li>
                                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Resident Directory</li>
                            </ul>
                        </div>
                    </div>

                    {/* Professional Card */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:bg-white/[0.07] overflow-hidden text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Professional</h3>
                            <p className="text-white/50 leading-relaxed mb-6">
                                Coworking spaces, alumni networks, and associations. Handle memberships, events, and networking opportunities.
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Global Networking</li>
                                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-400" /> Verified Professionals</li>
                            </ul>
                        </div>
                    </div>

                    {/* Virtual Card */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-all duration-300 hover:bg-white/[0.07] overflow-hidden text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6 text-teal-400 group-hover:scale-110 transition-transform duration-300">
                                <Gamepad2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Virtual</h3>
                            <p className="text-white/50 leading-relaxed mb-6">
                                Gaming guilds, Discord communities, and DAOs. Coordinate raids, govern decisions, and manage assets.
                            </p>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-teal-400" /> Global Clans</li>
                                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-teal-400" /> Role Management</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between text-white/40 text-sm">
                    <p>&copy; 2026 Isolate Platform. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
