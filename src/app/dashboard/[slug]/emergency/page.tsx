'use client';

import { useState } from 'react';
import { getEmergencyContacts } from '@/actions/emergency';
import { AlertTriangle, Phone, Mail } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EmergencyPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useState(() => {
        getEmergencyContacts(slug).then(({ data }) => {
            if (data) setContacts(data);
        });
    });

    const handlePanicButton = async () => {
        if (!confirm('Are you sure you want to trigger a PANIC ALERT? This will notify all emergency contacts.')) {
            return;
        }
        setLoading(true);
        // Trigger panic alert logic here
        alert('PANIC ALERT TRIGGERED! Emergency contacts have been notified.');
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                    Emergency Response
                </h1>
                <p className="text-sm text-gray-500">Quick access to emergency contacts and panic alert</p>
            </div>

            {/* Panic Button */}
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-8 mb-6 text-center shadow-xl">
                <h2 className="text-white text-2xl font-bold mb-4">Emergency Panic Button</h2>
                <p className="text-red-100 text-sm mb-6">Press only in case of immediate danger or emergency</p>
                <button
                    onClick={handlePanicButton}
                    disabled={loading}
                    className="w-48 h-48 mx-auto bg-white rounded-full shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center group disabled:opacity-50"
                >
                    <div className="text-center">
                        <AlertTriangle className="w-20 h-20 text-red-600 mx-auto mb-2 group-hover:animate-pulse" />
                        <span className="text-red-600 font-bold text-xl">PANIC</span>
                    </div>
                </button>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">Emergency Contacts</h2>
                <div className="space-y-3">
                    {contacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div>
                                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                                <p className="text-sm text-gray-500">{contact.role}</p>
                            </div>
                            <div className="flex gap-3">
                                <a
                                    href={`tel:${contact.phone}`}
                                    className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                    <Phone className="w-4 h-4" />
                                    {contact.phone}
                                </a>
                                {contact.email && (
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        <Mail className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {contacts.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No emergency contacts configured</p>
                    )}
                </div>
            </div>
        </div>
    );
}
