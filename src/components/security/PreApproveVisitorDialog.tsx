'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPreApproval } from '@/actions/security';

interface PreApproveVisitorDialogProps {
    communityId: string;
}

export default function PreApproveVisitorDialog({ communityId }: PreApproveVisitorDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        visitor_name: '',
        visitor_phone: '',
        purpose: '',
        valid_from: new Date().toISOString().slice(0, 16),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await createPreApproval(communityId, formData);

            if (result.error) {
                alert('Failed to pre-approve visitor: ' + JSON.stringify(result.error));
            } else {
                setIsOpen(false);
                setFormData({
                    visitor_name: '',
                    visitor_phone: '',
                    purpose: '',
                    valid_from: new Date().toISOString().slice(0, 16),
                    valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                });
                if (result.otp) {
                    alert(`Visitor approved! OTP: ${result.otp}`);
                }
                router.refresh();
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Pre-Approve Visitor
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
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
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                required
                                type="tel"
                                value={formData.visitor_phone}
                                onChange={e => setFormData({ ...formData, visitor_phone: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                            <input
                                required
                                type="text"
                                value={formData.purpose}
                                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Delivery, Guest, etc."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.valid_from}
                                onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.valid_until}
                                onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Pre-Approve
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
