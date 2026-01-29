import { getDocuments } from '@/actions/compliance';
import { createClient } from '@/utils/supabase/server';
import { FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface DocsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function DocumentsPage({ params }: DocsPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    const { data: docs } = await getDocuments(tenantId);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-7 h-7 text-indigo-600" />
                    Documents & Forms
                </h1>
                <p className="text-sm text-gray-500">Access community bylaws, minutes, and forms.</p>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                {(!docs || docs.length === 0) ? (
                    <div className="p-10 text-center text-gray-500">
                        No documents uploaded yet.
                    </div>
                ) : (
                    <div className="divide-y">
                        {docs.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{doc.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                                            <span className="text-xs text-gray-500">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={doc.file_url}
                                    target="_blank"
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                >
                                    <Download className="h-5 w-5" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
