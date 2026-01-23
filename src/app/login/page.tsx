import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { login, signup } from "./actions";

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 text-white">
            {/* Left: Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-[#050505] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold mb-6">Welcome to Isolate.</h1>
                    <p className="text-xl text-white/60 leading-relaxed">
                        Your passport to the world's diverse communities. Join today to unlock access to physical spaces, professional networks, and virtual worlds.
                    </p>
                </div>
                <div className="relative z-10 text-sm text-white/30">
                    &copy; 2026 Isolate Platform
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex flex-col items-center justify-center p-6 bg-black">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold">Sign in to your account</h2>
                        <p className="mt-2 text-white/50">
                            Or <Link href="/login?mode=signup" className="text-purple-400 hover:text-purple-300">create a new account</Link>
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/70">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 focus:border-purple-500 focus:ring-purple-500 focus:outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/70">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 focus:border-purple-500 focus:ring-purple-500 focus:outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                formAction={login}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:scale-[0.98] transition-all"
                            >
                                Sign in
                            </button>
                            <button
                                formAction={signup}
                                className="w-full flex justify-center py-3 px-4 border border-white/10 rounded-lg text-sm font-semibold text-white bg-white/5 hover:bg-white/10 focus:outline-none active:scale-[0.98] transition-all"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
