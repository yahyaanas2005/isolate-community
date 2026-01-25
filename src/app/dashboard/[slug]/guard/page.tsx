import { getPatrolLogs, getIncidents } from '@/actions/guard';
import ReportIncidentDialog from '@/components/guard/ReportIncidentDialog';
import { Shield, MapPin, AlertTriangle } from 'lucide-react';

interface GuardPageProps {
    params: Promise<{ slug: string }>;
}

export default async function GuardPage({ params }: GuardPageProps) {
    const { slug } = await params;
    const { data: patrols } = await getPatrolLogs(slug);
    const { data: incidents } = await getIncidents(slug);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-7 h-7 text-blue-600" />
                        Guard Operations
                    </h1>
                    <p className="text-sm text-gray-500">Patrol tracking and incident management</p>
                </div>
                <ReportIncidentDialog communityId={slug} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Patrols */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Recent Patrols
                    </h2>
                    <div className="space-y-3">
                        {patrols?.slice(0, 5).map(patrol => (
                            <div key={patrol.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-gray-900">Patrol #{patrol.id.slice(0, 8)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${patrol.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {patrol.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {new Date(patrol.started_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                        {(!patrols || patrols.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">No patrol logs yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Incidents */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Recent Incidents
                    </h2>
                    <div className="space-y-3">
                        {incidents?.slice(0, 5).map(incident => (
                            <div key={incident.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-gray-900">{incident.type.replace('_', ' ')}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {incident.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{incident.description}</p>
                                <p className="text-xs text-gray-500">{incident.location}</p>
                            </div>
                        ))}
                        {(!incidents || incidents.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">No incidents reported</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
