'use client';

import { useState } from 'react';
import { X, Loader2, Type, Tag as TagIcon } from 'lucide-react';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    groupId?: string;
    onSuccess?: () => void;
}

export function CreatePostModal({ isOpen, onClose, tenantId, groupId, onSuccess }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: tenantId,
                    group_id: groupId,
                    title: title.trim() || null,
                    content: content.trim(),
                    category: category.trim() || null,
                    tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create post');
                setLoading(false);
                return;
            }

            // Success! Reset and close
            setTitle('');
            setContent('');
            setCategory('');
            setTags('');
            onClose();
            if (onSuccess) onSuccess();

        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setTitle('');
            setContent('');
            setCategory('');
            setTags('');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                {!loading && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <h2 className="text-2xl font-bold mb-2">Create Post</h2>
                <p className="text-white/50 text-sm mb-6">
                    Share something with your community
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your post a title..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Content *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            rows={6}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Category & Tags Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. Announcement"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                                <TagIcon className="w-4 h-4" />
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="event, important"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
