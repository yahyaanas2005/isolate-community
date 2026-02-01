import { getTenantBySlug } from '@/actions/shared';
import { getCommunityStats } from '@/actions/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, DollarSign, Activity, CheckCircle2, Megaphone } from 'lucide-react';

export default async function AnalyticsPage({ params }: { params: { slug: string } }) {
    const tenant = await getTenantBySlug(params.slug);
    if (!tenant) return <div>Tenant not found</div>;

    const stats = await getCommunityStats(tenant.id);

    // Calculate Health Score (Simple Metric: 100 - (Pending Complaints * 5))
    const healthScore = Math.max(0, 100 - (stats.complaints.pending * 5));
    const healthColor = healthScore > 80 ? 'text-green-600' : healthScore > 50 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Community Analytics</h1>
                <p className="text-muted-foreground">Real-time insights and health metrics.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.members.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.members.pending > 0 ? `${stats.members.pending} pending approval` : 'All active'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.complaints.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.complaints.resolved} resolved total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.finance.pendingDues.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            From sent invoices
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Community Health</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${healthColor}`}>{healthScore}%</div>
                        <p className="text-xs text-muted-foreground">
                            Based on open tickets
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Complaint Resolution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Resolved</span>
                                    <span className="font-medium">{stats.complaints.resolved}</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${stats.complaints.total > 0 ? (stats.complaints.resolved / stats.complaints.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Pending</span>
                                    <span className="font-medium">{stats.complaints.pending}</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{ width: `${stats.complaints.total > 0 ? (stats.complaints.pending / stats.complaints.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Engagement Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.notices.active}</div>
                                <p className="text-sm text-muted-foreground">Active Announcements</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                            <div className="space-y-2 text-sm text-blue-600">
                                <a href={`/dashboard/${params.slug}/notices`} className="flex items-center hover:underline">
                                    View Announcements &rarr;
                                </a>
                                <a href={`/dashboard/${params.slug}/finance`} className="flex items-center hover:underline">
                                    Manage Invoices &rarr;
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
