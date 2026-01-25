'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    id: string;
    type: 'ticket' | 'notice' | 'event' | 'listing' | 'violation' | 'noc' | 'invoice' | 'visitor';
    title: string;
    description: string;
    url: string;
    relevance: number;
}

interface GlobalSearchProps {
    communitySlug: string;
}

export default function GlobalSearch({ communitySlug }: GlobalSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, communitySlug })
                });
                const data = await response.json();
                setResults(data.results || []);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, communitySlug]);

    const handleResultClick = (url: string) => {
        router.push(url);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={searchRef} className="relative">
            {/* Search Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors w-full md:w-64"
            >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 flex-1 text-left">Search anything...</span>
                <kbd className="hidden md:inline-block px-2 py-1 text-xs bg-gray-100 rounded border border-gray-300">⌘K</kbd>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-4 border-b">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search tickets, notices, events, marketplace..."
                                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                                autoFocus
                            />
                            {loading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="max-h-96 overflow-y-auto">
                            {results.length > 0 ? (
                                <div className="p-2">
                                    {results.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleResultClick(result.url)}
                                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                            {result.type}
                                                        </span>
                                                        <h3 className="font-semibold text-gray-900">{result.title}</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2">{result.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : query.length >= 2 && !loading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No results found for "{query}"</p>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    <p className="text-sm">Start typing to search across all modules</p>
                                    <p className="text-xs mt-2">Tickets • Notices • Events • Marketplace • Violations • NOC</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
