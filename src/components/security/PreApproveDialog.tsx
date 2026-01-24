'use client';

import { useState } from 'react';
import { Plus, X, Loader2, Copy, Check } from 'lucide-react';
import { createPreApproval } from '@/actions/security';
import { useRouter } from 'next/navigation';

interface PreApproveDialogProps {
    communityId: string;
}

export default function PreApproveDialog({ communityId }: PreApproveDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        visitor_name: '',
        visitor_phone: '',
        valid_from: new Date().toISOString().slice(0, 16),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        purpose: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await createPreApproval(communityId, formData);
            if (result.error) {
                alert('Failed: ' + JSON.stringify(result.error));
            } else {
                setOtp(result.otp || '');
                router.refresh();
            }
        } catch (err) {
            alert('Error creating pre-approval');
        } finally {
            setLoading(false);
        }
    };

    const copyOtp = () => {
        if (otp) {
            navigator.clipboard.writeText(otp);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Pre-Approve Visitor
            </button>
        );
    }

    if (otp) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                    <h2 className="font-bold text-xl text-gray-900 mb-4">Visitor Approved!</h2>
                    <p className="text-sm text-gray-600 mb-4">Share this OTP with your visitor:</p>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-mono font-bold text-green-700">{otp}</span>
                            <button onClick={copyOtp} className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-green-600" />}
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                        Valid from {new Date(formData.valid_from).toLocaleString()} to {new Date(formData.valid_until).toLocaleString()}
                    </p>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setOtp(null);
                            setFormData({
                                visitor_name: '',
                                visitor_phone: '',
                                valid_from: new Date().toISOString().slice(0, 16),
                                valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                                purpose: ''
                            });
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-semibold text-gray-900">Pre-Approve Visitor</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
                        <input
                            required
                            type="text"
                            value={formData.visitor_name}
                            onChange={e => setFormData({ ...formData, visitor_name: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            required
                            type="tel"
                            value={formData.visitor_phone}
                            onChange={e => setFormData({ ...formData, visitor_phone: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="+1234567890"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                        <input
                            required
                            type="text"
                            value={formData.purpose}
                            onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Family visit"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.valid_from}
                                onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.valid_until}
                                onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Generate OTP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
