import { Listing } from '@/lib/types/marketplace';
import { DollarSign, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ListingCardProps {
    listing: Listing;
    basePath: string;
}

export default function ListingCard({ listing, basePath }: ListingCardProps) {
    const imageUrl = listing.images?.[0] || '/placeholder-product.png';

    return (
        <Link
            href={`${basePath}/${listing.id}`}
            className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden group"
        >
            <div className="relative h-48 bg-gray-100">
                {listing.images?.[0] ? (
                    <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    {listing.category}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {listing.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                    {listing.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                        <DollarSign className="w-5 h-5" />
                        {listing.price.toLocaleString()}
                    </div>
                    <span className="text-xs text-gray-400">
                        {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </Link>
    );
}
