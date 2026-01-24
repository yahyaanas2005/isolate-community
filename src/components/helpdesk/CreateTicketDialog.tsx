'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createTicket } from '@/actions/helpdesk';
import { TicketCategory, TicketPriority } from '@/lib/types/helpdesk';
import { useRouter } from 'next/navigation';

interface CreateTicketDialogProps {
    communityId: string;
    categories: TicketCategory[];
}

export default function CreateTicketDialog({ communityId, categories }: CreateTicketDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        priority: 'MEDIUM' as TicketPriority,
        tower: '',
        unit_id: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure category is selected
            if (!formData.category_id && categories.length > 0) {
                formData.category_id = categories[0].id;
            }

            const result = await createTicket(communityId, {
                ...formData,
                // Fallback if user didn't select but we have categories
                category_id: formData.category_id || (categories[0]?.id)
            });

            if (result.error) {
                alert('Failed to create ticket: ' + JSON.stringify(result.error));
            } else {
                setIsOpen(false);
                setFormData({ title: '', description: '', category_id: '', priority: 'MEDIUM', tower: '', unit_id: '' });
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Plus className="w-4 h-4" />
                New Ticket
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-semibold text-gray-900">Create New Ticket</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., Leaking tap in kitchen"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tower/Unit</label>
                            <input
                                type="text"
                                value={formData.tower}
                                onChange={e => setFormData({ ...formData, tower: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. A-101"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Describe the issue in detail..."
                        />
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
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
