'use client';

import { ShoppingBag, Tag, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ItemList({ items }: { items: any[] }) {
    if (items.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No items for sale. Be the first!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {/* Placeholder for Image */}
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900 truncate pr-2">{item.title}</h3>
                            <span className="font-bold text-indigo-600 shrink-0">PKR {item.price.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>

                        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                            <Badge variant="outline" className="capitalize">{item.condition}</Badge>
                            <div className="flex-1"></div>
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={item.seller?.avatar_url} />
                                <AvatarFallback className="text-[10px]">S</AvatarFallback>
                            </Avatar>
                            <span>{item.seller?.full_name}</span>
                        </div>

                        <Button className="w-full mt-4" size="sm">Contact Seller</Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
