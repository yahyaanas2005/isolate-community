'use client';

import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';

export default function ReputationPage() {
    const badges = [
        { id: 1, name: 'Early Adopter', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100', description: 'Joined in the first month' },
        { id: 2, name: 'Helpful Neighbor', icon: Medal, color: 'text-blue-500', bg: 'bg-blue-100', description: 'Resolved 5 daily help requests' },
        { id: 3, name: 'Event Organizer', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-100', description: 'Hosted 3 community events' },
    ];

    const leaderboard = [
        { rank: 1, name: 'Alice Walker', score: 1250, badge: 'Early Adopter' },
        { rank: 2, name: 'Bob Smith', score: 980, badge: 'Helpful Neighbor' },
        { rank: 3, name: 'Charlie Davis', score: 850, badge: 'Event Organizer' },
        { rank: 4, name: 'You', score: 720, badge: 'Newcomer' },
        { rank: 5, name: 'Diana Prince', score: 600, badge: 'Newcomer' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community Reputation</h1>
                    <p className="text-muted-foreground">Earn points and badges for contributing to the community.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 rounded-full">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-800">Your Score: 720</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Badges Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Medal className="w-5 h-5" />
                        Available Badges
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {badges.map((badge) => (
                            <div key={badge.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className={`p-3 rounded-full ${badge.bg} ${badge.color}`}>
                                    <badge.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{badge.name}</h4>
                                    <p className="text-xs text-gray-500">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Top Contributors
                    </h3>
                    <div className="space-y-4">
                        {leaderboard.map((user) => (
                            <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${user.name === 'You' ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center font-bold text-sm rounded-full ${user.rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {user.rank}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-medium ${user.name === 'You' ? 'text-blue-700' : 'text-gray-700'}`}>{user.name}</p>
                                        <p className="text-[10px] text-gray-500">{user.badge}</p>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-gray-900">
                                    {user.score} pts
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
