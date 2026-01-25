import { getEvents } from '@/actions/events';
import EventCard from '@/components/events/EventCard';
import { Calendar, Plus } from 'lucide-react';

interface EventsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function EventsPage({ params }: EventsPageProps) {
    const { slug } = await params;
    const { data: events, error } = await getEvents(slug);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-7 h-7 text-purple-600" />
                        Events Calendar
                    </h1>
                    <p className="text-sm text-gray-500">Upcoming community events and activities</p>
                </div>
                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Create Event
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load events. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events?.map(event => (
                    <EventCard key={event.id} event={event} basePath={`/dashboard/${slug}/events`} />
                ))}
            </div>

            {events?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming events.</p>
                </div>
            )}
        </div>
    );
}
