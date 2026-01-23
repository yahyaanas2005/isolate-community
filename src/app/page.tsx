import Link from 'next/link';

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
                <h1 className="text-4xl font-bold">Isolate Community Platform</h1>
                <p className="text-lg text-gray-600 max-w-xl">
                    A multi-tenant community management system supporting Physical, Professional, and Virtual communities.
                </p>

                <div className="flex gap-4 items-center flex-col sm:flex-row">
                    <Link
                        href="/dashboard/members"
                        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                    >
                        Go to Members Dashboard
                    </Link>
                    <a
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                        href="https://github.com/yahyaanas2005/isolate-community"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View GitHub
                    </a>
                </div>
            </main>
        </div>
    );
}
