'use client';

import { Globe } from 'lucide-react';

export default function LanguageSelector() {
    return (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer rounded-md hover:bg-gray-100 transition-colors">
            <Globe className="w-4 h-4" />
            <select
                className="bg-transparent border-none focus:ring-0 cursor-pointer text-sm font-medium"
                defaultValue="en"
            >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="hi">हिन्दी (Hindi)</option>
            </select>
        </div>
    );
}
