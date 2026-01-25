import { getStoreProducts } from '@/actions/store';
import { ShoppingCart, Package } from 'lucide-react';

interface StorePageProps {
    params: Promise<{ slug: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
    const { slug } = await params;
    const { data: products } = await getStoreProducts(slug);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-7 h-7 text-purple-600" />
                    Community Store
                </h1>
                <p className="text-sm text-gray-500">Order essentials delivered to your doorstep</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products?.map(product => (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package className="w-16 h-16 text-white/50" />
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-purple-600">${product.price}</span>
                                <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                            </div>
                            <button className="w-full mt-3 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(!products || products.length === 0) && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No products available at the moment</p>
                </div>
            )}
        </div>
    );
}
