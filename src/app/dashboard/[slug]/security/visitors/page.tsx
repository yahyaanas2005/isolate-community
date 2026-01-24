export default function VisitorsPage({ params }: { params: { slug: string } }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Visitors</h1>
                    <p className="text-muted-foreground">Pre-approve guests for faster entry.</p>
                </div>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                    + Invite Guest
                </button>
            </div>

            <div className="rounded-md border bg-white">
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-blue-50 text-blue-500">
                        {/* Icon placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">No active passes</h3>
                        <p className="text-muted-foreground">Create a pass for your upcoming guests.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
