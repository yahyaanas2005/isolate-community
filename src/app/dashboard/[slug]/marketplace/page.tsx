'use client';

import { useState } from 'react';
import { Search, Filter, Plus, MessageCircle, DollarSign, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage({ params }: { params: { slug: string } }) {
    // Mock Data
    const listings = [
        { id: 1, title: 'IKEA Sofa Bed', price: 150, currency: 'USD', condition: 'Like New', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', seller: 'Sarah J.', posted: '2d ago' },
        { id: 2, title: 'Mountain Bike', price: 220, currency: 'USD', condition: 'Used', image: 'https://images.unsplash.com/photo-1576435728678-be95f39e8ab1?w=400&h=300&fit=crop', seller: 'Mike R.', posted: '5h ago' },
        { id: 3, title: 'MacBook Pro M1', price: 850, currency: 'USD', condition: 'Good', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400&h=300&fit=crop', seller: 'Alex T.', posted: '1w ago' },
        { id: 4, title: 'Moving Boxes (Set of 20)', price: 0, currency: 'USD', condition: 'New', image: null, seller: 'Jenny W.', posted: '1h ago' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
                    <p className="text-muted-foreground">Buy, sell, and trade with your neighbors.</p>
                </div>
                <Link href={`/dashboard/${params.slug}/marketplace/new`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Sell Item
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        placeholder="Search listings..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((item) => (
                    <div key={item.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                        <div className="aspect-[4/3] bg-gray-100 relative">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-medium">
                                {item.condition}
                            </span>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 truncate">{item.title}</h3>
                                <span className="font-bold text-green-700">
                                    {item.price > 0 ? `$${item.price}` : 'FREE'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                                <span>{item.seller}</span>
                                <span>{item.posted}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
