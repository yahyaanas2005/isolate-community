'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function handleAuth(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    // 1. First, try to SIGN IN (Login)
    // This covers: Existing User + Correct Password
    const { error: signInError } = await supabase.auth.signInWithPassword(data)

    if (!signInError) {
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    // 2. If Sign In failed, it could be:
    //    a) Wrong Password (for existing user)
    //    b) User does not exist at all
    //    c) System error

    // We attempt SIGN UP to handle case (b).
    const { error: signUpError } = await supabase.auth.signUp({
        ...data,
        options: {
            data: {
                full_name: '',
            }
        }
    })

    if (signUpError) {
        // 3. Analyze Sign Up Failure
        // If it says "User already registered", it confirms Case (a): User Exists + Wrong Password.
        if (signUpError.message.includes('already registered')) {
            redirect('/login?error=Account exists. Please enter the correct password.')
        }

        // Other errors (e.g. Rate limit, weak password)
        console.error('Auth Error:', signUpError.message)
        redirect(`/login?error=${encodeURIComponent(signUpError.message)}`)
    }

    // 4. Success Case (c): New User Created
    // If 'Confirm Email' is disabled, they are now logged in.
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}
