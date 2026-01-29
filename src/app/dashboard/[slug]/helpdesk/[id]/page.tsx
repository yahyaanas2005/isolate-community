import { getComplaintById } from '@/actions/complaints';
import ComplaintDetailView from '@/components/complaints/ComplaintDetailView';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

interface ComplaintPageProps {
    params: Promise<{ slug: string; id: string }>;
}

export default async function ComplaintPage({ params }: ComplaintPageProps) {
    const { slug, id } = await params;

    const { complaint, error } = await getComplaintById(id);

    if (error || !complaint) {
        if (error) console.error(error);
        return notFound();
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <ComplaintDetailView
                complaint={complaint}
                slug={slug}
            />
        </div>
    );
}
