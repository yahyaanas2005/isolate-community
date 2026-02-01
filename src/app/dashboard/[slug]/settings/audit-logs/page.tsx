import { getTenantBySlug } from '@/actions/shared';
import { getAuditLogs } from '@/actions/audit';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Search, User, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function AuditLogsPage({ params, searchParams }: { params: { slug: string }, searchParams: { q?: string } }) {
    const tenant = await getTenantBySlug(params.slug);
    if (!tenant) return <div>Tenant not found</div>;

    const searchTerm = searchParams.q || '';
    const { data: logs, count } = await getAuditLogs(tenant.id, {
        action: searchTerm
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">Track system activity and security events.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline">
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search logs by action..."
                        className="pl-8 w-full md:w-[300px]"
                        defaultValue={searchTerm}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Activity Log ({count} entries)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {logs && logs.length > 0 ? logs.map((log: any) => (
                            <div key={log.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={log.actor?.avatar_url} />
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {log.actor?.full_name || 'System User'} <span className="text-muted-foreground font-normal">performed</span> {log.action}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Entity: <span className="font-mono bg-gray-100 px-1 rounded">{log.entity_type}</span> ID: {log.entity_id}
                                        </p>
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <pre className="text-[10px] bg-slate-50 p-2 rounded mt-1 overflow-x-auto max-w-[500px]">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                No logs found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
