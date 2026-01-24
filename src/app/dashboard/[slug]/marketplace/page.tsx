import { getListings } from '@/actions/marketplace';
import ListingCard from '@/components/marketplace/ListingCard';
import CreateListingDialog from '@/components/marketplace/CreateListingDialog';
import { ShoppingBag, TrendingUp } from 'lucide-react';

interface MarketplacePageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ category?: string }>;
}

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles', 'Books', 'Clothing', 'Services', 'Other'];

export default async function MarketplacePage({ params, searchParams }: MarketplacePageProps) {
    const { slug } = await params;
    const { category } = await searchParams;
    const communityId = slug;

    const { data: listings, error } = await getListings(
        communityId,
        category && category !== 'All' ? category : undefined
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-7 h-7 text-blue-600" />
                        Marketplace
                    </h1>
                    <p className="text-sm text-gray-500">Buy and sell within your community</p>
                </div>
                <CreateListingDialog communityId={communityId} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Listings</p>
                            <p className="text-2xl font-bold text-gray-900">{listings?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">This Week</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {listings?.filter(l => {
                                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                    return new Date(l.created_at) > weekAgo;
                                }).length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                    <CategoryButton
                        key={cat}
                        label={cat}
                        active={!category ? cat === 'All' : category === cat}
                        href={cat === 'All' ? `/dashboard/${slug}/marketplace` : `/dashboard/${slug}/marketplace?category=${cat}`}
                    />
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load listings. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings?.map(listing => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        basePath={`/dashboard/${slug}/marketplace`}
                    />
                ))}
            </div>

            {listings?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No listings found. Be the first to post!</p>
                </div>
            )}
        </div>
    );
}

function CategoryButton({ label, active, href }: { label: string, active: boolean, href: string }) {
    return (
        <a
            href={href}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${active
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
        >
            {label}
        </a>
    );
}
