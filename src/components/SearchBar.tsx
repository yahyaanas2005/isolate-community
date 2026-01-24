'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { SearchResult } from '@/lib/types';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (term: string) => {
        setQuery(term);
        if (term.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        setIsOpen(true);

        try {
            // Call next.js API route instead of Edge Function
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: term,
                    community_id: null
                })
            });

            const data = await response.json();

            if (data?.results) {
                setResults(data.results);
            } else {
                console.log('No vector results, falling back to db');
                // Fallback to DB search
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                const { data: dbData } = await supabase
                    .from('searchable_content')
                    .select('*')
                    .ilike('title', `%${term}%`)
                    .limit(5);
                if (dbData) setResults(dbData as any);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative relative w-full max-w-md mx-auto">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 sm:text-sm transition-colors"
                    placeholder="Ask AI Search..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold bg-white/5">
                        AI Recommended
                    </div>
                    <ul>
                        {results.map((result) => (
                            <li key={result.id}>
                                <Link
                                    href={result.url_path}
                                    className="block px-4 py-3 hover:bg-white/5 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="text-sm font-medium text-white">{result.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{result.body_excerpt}</div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold border border-blue-400/20 inline-block px-1 rounded">
                                            {result.content_type}
                                        </div>
                                        {/* Show relevancy score if available */}
                                        {/* @ts-ignore */}
                                        {result.similarity && (
                                            <span className="text-[10px] text-green-500">
                                                {Math.round(result.similarity * 100)}% Match
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
