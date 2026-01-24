export default function DashboardOverviewPage({ params }: { params: { slug: string } }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Community: {params.slug}</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'Total Members', value: '128', icon: '👤', trend: '+12%' },
                    { title: 'Active Issues', value: '5', icon: '⚠️', trend: '-2%' },
                    { title: 'Upcoming Events', value: '3', icon: '📅', trend: 'Next: Sat' },
                    { title: 'Pending Revenue', value: '$2,450', icon: '💰', trend: '+5%' },
                ].map((stat) => (
                    <div key={stat.title} className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">{stat.title}</h3>
                            <div className="text-2xl">{stat.icon}</div>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground pt-1">
                            <span className="text-green-500 font-medium">{stat.trend}</span> from last month
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 border-b">
                        <h3 className="font-semibold">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-8">
                            {[
                                { user: 'Sarah M.', action: 'submitted a maintenance request', time: '2 hours ago' },
                                { user: 'John D.', action: 'paid invoice #INV-2024-001', time: '4 hours ago' },
                                { user: 'Security Gate', action: 'checked in Visitor: Mike Ross', time: '5 hours ago' },
                                { user: 'Admin', action: 'published new poll: "Gym Timing"', time: 'Yesterday' },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.user} <span className="font-normal text-muted-foreground">{activity.action}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 border-b">
                        <h3 className="font-semibold">Quick Actions</h3>
                    </div>
                    <div className="p-6 grid gap-4">
                        <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                            📢 Post Announcement
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                            🛡️ Register Visitor
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                            📅 Create Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
