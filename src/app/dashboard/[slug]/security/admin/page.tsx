export default function SecurityAdminPage({ params }: { params: { slug: string } }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Administration</h1>
                    <p className="text-muted-foreground">Manage guards, daily help, and view logs.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Guard Roster</h3>
                        <button className="w-full border border-dashed py-4 rounded-md text-muted-foreground hover:bg-accent">
                            + Add Security Guard
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Daily Help Database</h3>
                        <button className="w-full border border-dashed py-4 rounded-md text-muted-foreground hover:bg-accent">
                            + Register Maid/Helper
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
