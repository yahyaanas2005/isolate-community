'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Search, Filter, Check, X } from 'lucide-react';
import { MemberStatus, updateMembershipStatus } from '@/actions/members';
import { Tenant } from '@/lib/types';
import AddMemberDialog from './AddMemberDialog';

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-900 text-white',
    blacklisted: 'bg-black text-white',
};

export default function MembersList({
    members,
    tenant,
    page,
    count
}: {
    members: any[],
    tenant: Tenant,
    page: number,
    count: number
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Destructure tenant for easy access
    const { slug } = tenant;

    const handleStatusChange = async (memberId: string, newStatus: MemberStatus) => {
        setIsLoading(true);
        await updateMembershipStatus(memberId, newStatus, pathname);
        setIsLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`${pathname}?search=${search}`);
    };

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Search members..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                    <AddMemberDialog tenant={tenant} />
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={member.user?.avatar_url} />
                                            {/* Note: Safe operator for member.user in case of bad data */}
                                            <AvatarFallback>{member.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{member.user?.full_name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{member.user?.email}</div>
                                        {member.user?.phone && <div className="text-xs text-gray-400">{member.user.phone}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{member.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {member.type ? (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                                {member.type.name}
                                            </Badge>
                                        ) : <span className="text-gray-400 text-sm">-</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`capitalize border-none shadow-none ${STATUS_COLORS[member.status || 'active'] || 'bg-gray-100'}`}>
                                            {member.status || 'active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {member.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleStatusChange(member.id, 'active')}
                                                        title="Approve Membership"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleStatusChange(member.id, 'terminated')}
                                                        title="Reject Membership"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/members/${member.id}`)}>
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'active')}>
                                                        Mark Active
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'suspended')}>
                                                        Suspend
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(member.id, 'terminated')}>
                                                        Terminate Membership
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination footer would go here */}
            {count > 0 && (
                <div className="text-xs text-gray-500 text-center">
                    Showing {members.length} of {count} members
                </div>
            )}
        </div>
    );
}
