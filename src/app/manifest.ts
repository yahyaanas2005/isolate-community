import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Isolate Community',
        short_name: 'Isolate',
        description: 'The Unified Community Operating System',
        start_url: '/dashboard', // Default to dashboard if installed
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6', // Tailwind blue-500
        icons: [
            {
                src: '/logo-192.png',
                sizes: '192x192',
                type: 'image/png'
            },
            {
                src: '/logo-512.png',
                sizes: '512x512',
                type: 'image/png'
            }
        ],
        orientation: 'portrait'
    };
}
