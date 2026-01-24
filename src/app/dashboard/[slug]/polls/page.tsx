export default function PollsPage({ params }: { params: { slug: string } }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Polls & Elections</h1>
                    <p className="text-muted-foreground">Engage your community with quick votes.</p>
                </div>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                    Create Poll
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Poll Card Mockup */}
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white shadow hover:bg-green-500/80">
                                Open
                            </span>
                            <h3 className="text-lg font-bold">What feature should we build next?</h3>
                            <p className="text-sm text-muted-foreground">Closing in 2 days</p>
                        </div>
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Mobile App</span>
                                    <span>45%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div className="h-full rounded-full bg-primary w-[45%]"></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Better Search</span>
                                    <span>30%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div className="h-full rounded-full bg-primary w-[30%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3">
                            Vote Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
