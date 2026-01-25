import { Event } from '@/lib/types/events';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
    event: Event;
    basePath: string;
}

export default function EventCard({ event, basePath }: EventCardProps) {
    return (
        <Link
            href={`${basePath}/${event.id}`}
            className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden group"
        >
            <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
                {event.image_url ? (
                    <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/50" />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-xs font-bold">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {event.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                    {event.description}
                </p>

                <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.event_date).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                    </div>
                    {event.capacity && (
                        <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            Capacity: {event.capacity}
                        </div>
                    )}
                    {event.ticket_price && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <DollarSign className="w-3 h-3" />
                            {event.ticket_price}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
