'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in a real app, use Zod to validate inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: '', // We can ask for this later or add a field to the form
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/login?error=Could not create user')
    }

    // Ideally, we would have a trigger to create the profile.
    // If not, we might rely on the user being "lazy created" or create it here if we get the session back immediately (which we might not if email verification is on).
    // For this demo, let's assume auto-confirm is OFF (requires email click) OR ON.
    // We'll redirect to dashboard.

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
