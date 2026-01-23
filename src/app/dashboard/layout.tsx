import { TenantProvider } from '@/components/TenantContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TenantProvider>
            <div className="min-h-screen bg-gray-50 text-black">
                {children}
            </div>
        </TenantProvider>
    );
}
