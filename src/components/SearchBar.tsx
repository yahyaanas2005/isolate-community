'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { SearchResult } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleSearch = async (term: string) => {
        setQuery(term);
        if (term.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        setIsOpen(true);

        try {
            // In MVP, we use simple text matching or FTS if supported in PostgREST
            // Real AI search would use an Edge Function to embed 'term' and query vector column
            // Here we simulate it by querying the searchable_content table with ilike
            const { data, error } = await supabase
                .from('searchable_content')
                .select('*')
                .ilike('title', `%${term}%`)
                .limit(5);

            if (data) {
                setResults(data as SearchResult[]);
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
                    placeholder="Search..."
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
                                    <div className="mt-1 text-[10px] uppercase tracking-wider text-blue-400 font-semibold border border-blue-400/20 inline-block px-1 rounded">
                                        {result.content_type}
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
