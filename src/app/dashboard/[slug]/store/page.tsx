import { getMarketItems } from '@/actions/market';
import ItemList from '@/components/market/ItemList';
import { createClient } from '@/utils/supabase/server';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorePageProps {
    params: Promise<{ slug: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    const { data: items } = await getMarketItems(tenantId);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingCart className="w-7 h-7 text-indigo-600" />
                        Community Store
                    </h1>
                    <p className="text-sm text-gray-500">Buy and sell items within your community.</p>
                </div>
                <Button>Sell an Item</Button>
            </div>

            <ItemList items={items || []} />
        </div>
    );
}
