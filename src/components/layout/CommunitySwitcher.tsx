'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronsUpDown,
    PlusCircle,
    Check,
    Building2,
    Users,
    LogOut
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CommunitySwitcherProps {
    currentSlug: string;
}

export function CommunitySwitcher({ currentSlug }: CommunitySwitcherProps) {
    const router = useRouter();
    const supabase = createClient();
    const [memberships, setMemberships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTenant, setCurrentTenant] = useState<any>(null);

    useEffect(() => {
        async function fetchCommunities() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('memberships')
                    .select('*, tenants(id, name, slug, logo_url)')
                    .eq('user_id', user.id);

                if (data) {
                    setMemberships(data);
                    const current = data.find((m: any) => m.tenants?.slug === currentSlug);
                    if (current) setCurrentTenant(current.tenants);
                }
            } catch (error) {
                console.error('Error fetching communities:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCommunities();
    }, [currentSlug, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return <div className="h-12 w-full bg-slate-100 animate-pulse rounded-lg" />;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="lg"
                    className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground p-2 h-auto flex items-center justify-between group hover:bg-slate-100"
                >
                    <div className="flex items-center gap-3 text-left overflow-hidden">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
                            {currentTenant?.logo_url ? (
                                <img src={currentTenant.logo_url} alt={currentTenant.name} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <Building2 className="h-4 w-4" />
                            )}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold text-slate-900">
                                {currentTenant?.name || 'Select Community'}
                            </span>
                            <span className="truncate text-xs text-slate-500">
                                {currentTenant?.slug ? `@${currentTenant.slug}` : 'Community OS'}
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl p-2"
                align="start"
                side="bottom"
                sideOffset={4}
            >
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    Switch Community
                </DropdownMenuLabel>

                <DropdownMenuGroup className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {memberships.map((membership) => (
                        <DropdownMenuItem
                            key={membership.id}
                            onClick={() => router.push(`/dashboard/${membership.tenants.slug}`)}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-lg cursor-pointer",
                                membership.tenants.slug === currentSlug && "bg-slate-100"
                            )}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white">
                                <Building2 className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">
                                    {membership.tenants.name}
                                </div>
                                <div className="text-xs text-slate-500 capitalize">
                                    {membership.role}
                                </div>
                            </div>
                            {membership.tenants.slug === currentSlug && (
                                <Check className="ml-auto h-4 w-4 text-blue-600" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <Link href="/onboarding">
                        <DropdownMenuItem className="gap-2 p-2 cursor-pointer text-blue-600 focus:text-blue-700 focus:bg-blue-50">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-100 bg-blue-50">
                                <PlusCircle className="h-4 w-4" />
                            </div>
                            <div className="font-medium">Create New Community</div>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/welcome">
                        <DropdownMenuItem className="gap-2 p-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50">
                                <Users className="h-4 w-4" />
                            </div>
                            <div className="font-medium">Join Community</div>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleSignOut} className="gap-2 p-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
