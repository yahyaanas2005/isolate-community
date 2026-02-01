'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SLARule {
    id?: string;
    priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
    response_time_hours: number;
    resolution_time_hours: number;
}

const DEFAULT_SLA: SLARule[] = [
    { priority: 'low', response_time_hours: 24, resolution_time_hours: 72 },
    { priority: 'medium', response_time_hours: 8, resolution_time_hours: 48 },
    { priority: 'high', response_time_hours: 4, resolution_time_hours: 24 },
    { priority: 'critical', response_time_hours: 1, resolution_time_hours: 6 },
    { priority: 'emergency', response_time_hours: 0.5, resolution_time_hours: 2 },
];

export default function SLAConfig({ tenantId }: { tenantId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [rules, setRules] = useState<SLARule[]>(DEFAULT_SLA);

    useEffect(() => {
        loadRules();
    }, [tenantId]);

    async function loadRules() {
        try {
            const { data } = await supabase
                .from('sla_rules')
                .select('*')
                .eq('tenant_id', tenantId);

            if (data && data.length > 0) {
                // Merge with defaults to ensure all priorities exist
                const merged = DEFAULT_SLA.map(def => {
                    const existing = data.find(d => d.priority === def.priority);
                    return existing ? { ...existing } : { ...def };
                });
                setRules(merged);
            }
        } catch (error) {
            console.error('Error loading SLA rules:', error);
            // alert('Failed to load SLA rules');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const { error } = await supabase.from('sla_rules').upsert(
                rules.map(r => ({
                    tenant_id: tenantId,
                    priority: r.priority,
                    response_time_hours: r.response_time_hours,
                    resolution_time_hours: r.resolution_time_hours,
                    category_id: null // Global defaults for now
                })),
                { onConflict: 'tenant_id,category_id,priority' }
            );

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            router.refresh();
        } catch (error) {
            console.error('Error saving SLA rules:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    }

    const updateRule = (priority: string, field: keyof SLARule, value: number) => {
        setRules(prev => prev.map(r =>
            r.priority === priority ? { ...r, [field]: value } : r
        ));
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Service Level Agreements (SLA)
                </CardTitle>
                <p className="text-sm text-gray-500">Define expected response and resolution times for each priority level.</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-500 border-b pb-2">
                        <div>Priority Level</div>
                        <div>Response Time (Hours)</div>
                        <div>Resolution Time (Hours)</div>
                    </div>

                    {rules.map((rule) => (
                        <div key={rule.priority} className="grid grid-cols-3 gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${rule.priority === 'critical' || rule.priority === 'emergency' ? 'bg-red-500' :
                                    rule.priority === 'high' ? 'bg-orange-500' :
                                        rule.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                                    }`} />
                                <span className="capitalize font-medium">{rule.priority}</span>
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={rule.response_time_hours}
                                    onChange={(e) => updateRule(rule.priority, 'response_time_hours', parseFloat(e.target.value))}
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={rule.resolution_time_hours}
                                    onChange={(e) => updateRule(rule.priority, 'resolution_time_hours', parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 flex justify-end items-center gap-4">
                        {success && (
                            <div className="flex items-center text-green-600 text-sm animate-in fade-in">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Settings saved successfully
                            </div>
                        )}
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Configuration
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
