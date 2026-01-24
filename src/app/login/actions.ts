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

    // 1. Attempt Sign In
    const { error: signInError } = await supabase.auth.signInWithPassword(data)

    if (!signInError) {
        // Success: Existing user logged in
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    // 2. If Sign In failed, check if it's because user doesn't exist?
    // Supabase returns "Invalid login credentials" for both "Wrong Password" and "User Not Found".
    // So we simply attempt Sign Up as the fallback.

    // Note: If user exists but typed WRONG password, SignUp will fail with "User already registered".
    // This correctly prevents hijacking an account by just trying to "Sign Up" with it.

    const { error: signUpError } = await supabase.auth.signUp({
        ...data,
        options: {
            data: {
                // Optional: Capture name if we added it to form, currently defaulting to empty
                full_name: '',
            }
        }
    })

    if (signUpError) {
        // If both failed, it means:
        // A) User exists + Wrong Password (signIn failed, then signUp says 'already registered')
        // B) Some other error (network, rate limit)

        // We redirect with a generic error, or try to be specific if we parse the message.
        console.error('Auth Attempt Failed:', { signInError: signInError.message, signUpError: signUpError.message })

        if (signUpError.message.includes('already registered')) {
            redirect('/login?error=Account exists. Please check your password.')
        }

        // Pass the actual error message for debugging
        redirect(`/login?error=${encodeURIComponent(signUpError.message)}`)
    }

    // Success: New user created and logged in (assuming 'Confirm Email' is disabled in Supabase)
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
