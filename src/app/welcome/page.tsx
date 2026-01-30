'use client';

import Link from 'next/link';
import { Building2, Users, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Welcome to Isolate</h1>
                    <p className="text-lg text-gray-600">You're not a member of any community yet. Let's get you valid!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Create New */}
                    <Card className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-100 group">
                        <CardHeader>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <CardTitle>Create a New Community</CardTitle>
                            <CardDescription>
                                Setup a new space for your residential complex, guild, or professional network.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/onboarding">
                                <Button className="w-full gap-2">
                                    Start Setup <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Join Existing */}
                    <Card className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-emerald-100 group">
                        <CardHeader>
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <CardTitle>Join Existing Community</CardTitle>
                            <CardDescription>
                                Have an invite code? Enter it here to join your team or neighbors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full gap-2" disabled>
                                    Enter Invite Code (Coming Soon)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
