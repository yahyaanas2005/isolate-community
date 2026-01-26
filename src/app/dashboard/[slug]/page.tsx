import OverviewContent from '@/components/dashboard/OverviewContent';

export default async function DashboardOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <OverviewContent slug={slug} />;
}
