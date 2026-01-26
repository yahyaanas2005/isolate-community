'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

export default function MobileNav({ slug }: { slug: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden flex items-center p-4 bg-white border-b justify-between">
            <span className="font-bold text-lg">Isolate</span>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Backdrop & Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative flex-1 w-full max-w-xs bg-white h-full shadow-xl">
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="h-full" onClick={(e) => {
                            // Close sidebar when a link is clicked
                            if ((e.target as HTMLElement).closest('a')) {
                                setIsOpen(false);
                            }
                        }}>
                            <Sidebar slug={slug} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
