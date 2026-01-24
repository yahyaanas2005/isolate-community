'use client';

import { CheckCircle, AlertCircle, Copy } from 'lucide-react';

export default function StripeSettingsPage({ params }: { params: { slug: string } }) {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-2">Stripe Payments Setup</h1>
            <p className="text-gray-500 mb-8">Connect your Stripe account to accept payments from members.</p>

            <div className="space-y-8">
                {/* Connection Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <span className="font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Connection Status</h3>
                            <p className="text-sm text-yellow-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Pending Configuration
                            </p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Connect Account
                    </button>
                </div>

                {/* Configuration Steps */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">How to Configure</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Get your API Keys</h4>
                                <p className="text-sm text-gray-600">
                                    Go to your <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-blue-600 underline">Stripe Dashboard</a> and copy your Publishable Key and Secret Key.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Add to Vercel Environment Variables</h4>
                                <p className="text-sm text-gray-600">
                                    Go to your Vercel Project Settings {'>'} Environment Variables and add these:
                                </p>
                                <div className="bg-gray-50 p-4 rounded-md font-mono text-xs space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</span>
                                        <Copy className="w-3 h-3 cursor-pointer text-gray-400" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>STRIPE_SECRET_KEY=sk_test_...</span>
                                        <Copy className="w-3 h-3 cursor-pointer text-gray-400" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>STRIPE_WEBHOOK_SECRET=whsec_...</span>
                                        <Copy className="w-3 h-3 cursor-pointer text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Redeploy</h4>
                                <p className="text-sm text-gray-600">
                                    Once saved, redeploy your project on Vercel for the changes to take effect.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
