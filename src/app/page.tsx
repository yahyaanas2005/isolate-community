import Link from 'next/link';
import { CommunityType } from '@/lib/types';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Isolate Community Platform
                </p>
            </div>

            <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-blue-700 before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-b after:from-sky-900 after:via-[#0141ff] after:opacity-40 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
                <h1 className="text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-600 pb-4">
                    Create Your Community
                </h1>
            </div>

            <p className="mb-12 text-lg text-slate-400">
                Select the type of community you want to build
            </p>

            <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8">

                {/* Type A */}
                <div className="group rounded-lg border border-transparent px-5 py-6 transition-colors hover:border-blue-500 hover:bg-blue-950/30 hover:shadow-lg hover:shadow-blue-500/20">
                    <h2 className={`mb-3 text-2xl font-semibold text-blue-400`}>
                        Physical{' '}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className={`m-0 max-w-[30ch] text-sm opacity-60 text-slate-300`}>
                        For Housing Societies, Trade Estates. Includes Gate Security, Asset Booking, Billing.
                    </p>
                    <button className="mt-6 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium w-full">
                        Select Physical
                    </button>
                </div>

                {/* Type B */}
                <div className="group rounded-lg border border-transparent px-5 py-6 transition-colors hover:border-emerald-500 hover:bg-emerald-950/30 hover:shadow-lg hover:shadow-emerald-500/20">
                    <h2 className={`mb-3 text-2xl font-semibold text-emerald-400`}>
                        Professional{' '}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className={`m-0 max-w-[30ch] text-sm opacity-60 text-slate-300`}>
                        For Associations, Unions. Includes Certifications, Job Board, Membership Dues.
                    </p>
                    <button className="mt-6 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium w-full">
                        Select Professional
                    </button>
                </div>

                {/* Type C */}
                <div className="group rounded-lg border border-transparent px-5 py-6 transition-colors hover:border-purple-500 hover:bg-purple-950/30 hover:shadow-lg hover:shadow-purple-500/20">
                    <h2 className={`mb-3 text-2xl font-semibold text-purple-400`}>
                        Virtual{' '}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className={`m-0 max-w-[30ch] text-sm opacity-60 text-slate-300`}>
                        For Online Clubs, Student Groups. Includes Forums, Marketplace, Donations.
                    </p>
                    <button className="mt-6 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium w-full">
                        Select Virtual
                    </button>
                </div>

            </div>
        </main>
    );
}
