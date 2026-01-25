import { getAccountingSummary, getBudgets, getGLEntries } from '@/actions/accounting';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

interface AccountingPageProps {
    params: Promise<{ slug: string }>;
}

export default async function AccountingPage({ params }: AccountingPageProps) {
    const { slug } = await params;
    const { data: summary } = await getAccountingSummary(slug);
    const { data: budgets } = await getBudgets(slug);
    const { data: entries } = await getGLEntries(slug);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <PieChart className="w-7 h-7 text-green-600" />
                    Accounting Dashboard
                </h1>
                <p className="text-sm text-gray-500">Financial reports and budget tracking</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Income</p>
                            <p className="text-2xl font-bold text-gray-900">${summary?.total_income.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-gray-900">${summary?.total_expenses.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Net Balance</p>
                            <p className={`text-2xl font-bold ${(summary?.net_balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${summary?.net_balance.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget Overview */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-4">Budget Overview</h2>
                    <div className="space-y-3">
                        {budgets?.map(budget => {
                            const percentage = (budget.spent_amount / budget.allocated_amount) * 100;
                            return (
                                <div key={budget.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{budget.category}</span>
                                        <span className="text-gray-500">${budget.spent_amount} / ${budget.allocated_amount}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {(!budgets || budgets.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">No budgets configured</p>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                    <div className="space-y-2">
                        {entries?.slice(0, 8).map(entry => (
                            <div key={entry.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{entry.account_name}</p>
                                    <p className="text-xs text-gray-500">{new Date(entry.transaction_date).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-sm font-semibold ${entry.credit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {entry.credit > 0 ? '+' : '-'}${(entry.credit || entry.debit).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        {(!entries || entries.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">No transactions yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
