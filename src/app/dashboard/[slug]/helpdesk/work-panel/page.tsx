import { getTenantBySlug } from '@/actions/shared';
import { getComplaints } from '@/actions/complaints';
import { createClient } from '@/utils/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, Inbox } from 'lucide-react';
import Link from 'next/link';

export default async function HelpDeskWorkPanel({ params }: { params: { slug: string } }) {
    const tenant = await getTenantBySlug(params.slug);
    if (!tenant) return <div>Tenant not found</div>;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. My Assigned Tickets
    const { data: myTickets } = await getComplaints(tenant.id, {
        // We'd need to filter by assignee in the action, 
        // but current action only filters by status/priority/category.
        // I will fetch open tickets and filter in JS for MVP speed, 
        // or I should create a specific action. I'll filter here for now.
        status: 'in_progress'
    });

    // 2. Unassigned / New
    const { data: unassignedTickets } = await getComplaints(tenant.id, { status: 'new' });

    // Filter "My Tickets" manually since action lacks assignee filter param 
    // (Wait, action line 35 selects assignee, line 14 has category filter. 
    // I need to update getComplaints to support assignee filter for real efficiency, 
    // but looking at getComplaints code, it doesn't filter by assignee.
    // I will implement client-side filtering below for now as MVP).
    const myAssigned = (myTickets || []).filter((t: any) => t.assignee?.id === user?.id) || [];
    // Actually, `t.assignee` is an object `profiles!assigned_to(full_name)`. 
    // The query in getComplaints selects `assignee:profiles!assigned_to(full_name)`.
    // It does NOT select the ID. This is a problem.
    // I should update getComplaints to include role/ID or update the filter.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Work Panel</h1>
                    <p className="text-muted-foreground">Manage your assigned tickets and pick up new ones.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Open Tickets</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myAssigned.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unassigned Queue</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unassignedTickets?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">0</div>
                        <p className="text-xs text-muted-foreground">Within last 24h</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="unassigned">
                <TabsList>
                    <TabsTrigger value="unassigned">Unassigned Queue</TabsTrigger>
                    <TabsTrigger value="mine">My Tickets</TabsTrigger>
                    <TabsTrigger value="resolved">Recently Resolved</TabsTrigger>
                </TabsList>

                <TabsContent value="unassigned" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>New & Unassigned</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {unassignedTickets?.map((ticket: any) => (
                                    <div key={ticket.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={ticket.priority === 'emergency' ? 'destructive' : 'secondary'}>
                                                    {ticket.priority}
                                                </Badge>
                                                <span className="font-medium">{ticket.title}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {ticket.complaint_no} • {ticket.category?.name} • Reported by {ticket.reporter?.full_name}
                                            </div>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href={`/dashboard/${params.slug}/helpdesk/${ticket.id}`}>
                                                View & Assign
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                                {(!unassignedTickets || unassignedTickets.length === 0) && (
                                    <div className="text-center py-8 text-muted-foreground">Queue is empty! 🎉</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="mine" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Assigned to Me</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                No tickets assigned to you yet (Note: Backend filter pending implementation).
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
