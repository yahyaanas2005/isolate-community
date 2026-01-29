'use client';

import { useState } from 'react';
import { verifyAndLogEntry } from '@/actions/security';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScanLine, CheckCircle, XCircle } from 'lucide-react';

export default function GateScanner({ tenantId }: { tenantId: string }) {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [visitor, setVisitor] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setStatus('idle');
        const res = await verifyAndLogEntry(tenantId, code.toUpperCase());

        if (res.success) {
            setStatus('success');
            setVisitor(res.visitor || '');
            setMessage('Access Granted');
            setCode(''); // Clear for next scan
        } else {
            setStatus('error');
            setMessage(res.error || 'Access Denied');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border text-center space-y-6">
            <div className="bg-gray-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanLine className="h-10 w-10 text-gray-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">Gate Entry Scanner</h2>
            <p className="text-gray-500">Scan QR code or enter pass code.</p>

            <form onSubmit={handleVerify} className="space-y-4">
                <Input
                    className="text-center text-2xl font-mono uppercase tracking-widest h-14"
                    placeholder="ENTER CODE"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value);
                        setStatus('idle');
                    }}
                    maxLength={6}
                />
                <Button size="lg" className="w-full h-12 text-lg" disabled={!code}>
                    Verify Entry
                </Button>
            </form>

            {status === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-green-800">Welcome, {visitor}</h3>
                    <p className="text-green-600 font-medium">Entry Logged</p>
                </div>
            )}

            {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in shake duration-300">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-red-800">Access Denied</h3>
                    <p className="text-red-600 font-medium">{message}</p>
                </div>
            )}
        </div>
    );
}
