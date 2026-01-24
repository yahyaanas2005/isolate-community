'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Post } from '@/lib/types';
import { Plus, Pin, MessageCircle, ThumbsUp, MoreVertical } from 'lucide-react';
import { CreatePostModal } from '@/components/CreatePostModal';
import Link from 'next/link';

export default function CommunityFeedPage() {
    const params = useParams();
    const slug = params.slug as string;
    const supabase = createClient();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    useEffect(() => {
        fetchCommunityAndPosts();
    }, [slug]);

    const fetchCommunityAndPosts = async () => {
        try {
            // 1. Get tenant by slug
            const { data: tenant } = await supabase
                .from('tenants')
                .select('id')
                .eq('slug', slug)
                .single();

            if (!tenant) {
                setLoading(false);
                return;
            }

            setTenantId(tenant.id);

            // 2. Fetch posts
            const { data: postsData, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    author:profiles(id, full_name, avatar_url, email),
                    comments:comments(count)
                `)
                .eq('tenant_id', tenant.id)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts:', error);
            } else {
                // Transform data
                const transformedPosts = postsData?.map((post: any) => ({
                    ...post,
                    comment_count: post.comments?.[0]?.count || 0
                })) || [];
                setPosts(transformedPosts);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="text-white/50 hover:text-white text-sm mb-1 block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold">Community Feed</h1>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 transition-colors font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Create Post
                    </button>
                </div>
            </header>

            {/* Feed */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white/70 mb-2">No posts yet</h3>
                        <p className="text-white/40 mb-6">Be the first to share something with your community!</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition-colors font-semibold"
                        >
                            Create First Post
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                            >
                                {/* Post Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                            {post.author?.full_name?.[0] || post.author?.email?.[0] || '?'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {post.author?.full_name || post.author?.email}
                                                </span>
                                                {post.is_pinned && (
                                                    <Pin className="w-4 h-4 text-purple-400" />
                                                )}
                                            </div>
                                            <span className="text-sm text-white/40">
                                                {formatDate(post.created_at!)}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Post Content */}
                                <div className="mb-4">
                                    {post.title && (
                                        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                                    )}
                                    <p className="text-white/80 whitespace-pre-wrap">{post.content}</p>
                                </div>

                                {/* Tags & Category */}
                                {(post.category || post.tags?.length) && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {post.category && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                {post.category}
                                            </span>
                                        )}
                                        {post.tags?.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Interaction Bar */}
                                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                                    <button className="flex items-center gap-2 text-white/60 hover:text-purple-400 transition-colors group">
                                        <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium">Like</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-white/60 hover:text-blue-400 transition-colors group">
                                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium">
                                            {post.comment_count || 0} {post.comment_count === 1 ? 'Comment' : 'Comments'}
                                        </span>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Post Modal */}
            {tenantId && (
                <CreatePostModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    tenantId={tenantId}
                    onSuccess={() => {
                        fetchCommunityAndPosts(); // Refresh posts
                    }}
                />
            )}
        </div>
    );
}
