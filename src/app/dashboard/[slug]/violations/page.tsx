import ViolationForm from '@/components/compliance/ViolationForm';
import { createClient } from '@/utils/supabase/server';
import { AlertTriangle } from 'lucide-react';

interface ViolationsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ViolationsPage({ params }: ViolationsPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    // Fetch my reports
    const { data: { user } } = await supabase.auth.getUser();
    const { data: myReports } = await supabase
        .from('violations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('reported_by', user?.id)
        .order('created_at', { ascending: false });

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                    Report Violation
                </h1>
                <p className="text-sm text-gray-500">Submit a report for rules violation (Noise, Parking, etc.)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-lg font-semibold mb-4">New Report</h2>
                    <ViolationForm tenantId={tenantId} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4">My Reports</h2>
                    <div className="space-y-4">
                        {myReports?.map((report) => (
                            <div key={report.id} className="bg-white p-4 rounded-lg border text-sm">
                                <div className="flex justify-between font-medium">
                                    <span className="capitalize">{report.type}</span>
                                    <span className={`capitalize ${report.status === 'resolved' ? 'text-green-600' : 'text-orange-600'}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 mt-1 line-clamp-2">{report.details}</p>
                                <div className="text-xs text-gray-400 mt-2">
                                    {new Date(report.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {(!myReports || myReports.length === 0) && (
                            <p className="text-gray-500 italic">No reports submitted.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
