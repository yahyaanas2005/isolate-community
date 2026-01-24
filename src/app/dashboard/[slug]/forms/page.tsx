export default function FormsPage({ params }: { params: { slug: string } }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Forms & Surveys</h1>
                    <p className="text-muted-foreground">Collect data from your members.</p>
                </div>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                    New Form
                </button>
            </div>

            <div className="rounded-md border">
                <div className="p-4 border-b bg-muted/40">
                    <h3 className="font-medium">Active Forms</h3>
                </div>
                <div className="p-8 text-center text-muted-foreground">
                    No active forms found. Create one to get started.
                </div>
            </div>
        </div>
    )
}
