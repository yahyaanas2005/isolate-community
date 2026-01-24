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

    // Validate input
    if (!data.email || !data.password) {
        redirect('/login?error=Email and password are required')
    }

    // 1. First, try to SIGN IN (Login)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(data)

    if (!signInError && signInData.user) {
        console.log('Sign in successful:', signInData.user.email)
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    // 2. If Sign In failed, try Sign Up (new user)
    console.log('Sign in failed, attempting sign up...')

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        ...data,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isolate-community-rcmg.vercel.app'}/dashboard`,
            data: {
                full_name: data.email.split('@')[0],
            }
        }
    })

    if (signUpError) {
        // User already exists with wrong password
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
            redirect('/login?error=Incorrect password. Please try again.')
        }

        // Other errors
        console.error('Auth Error:', signUpError.message)
        redirect(`/login?error=${encodeURIComponent(signUpError.message)}`)
    }

    // Sign up successful
    if (signUpData.user) {
        console.log('Sign up successful:', signUpData.user.email)

        // Check if email confirmation is required
        if (signUpData.session) {
            // User is automatically logged in (email confirmation disabled)
            revalidatePath('/', 'layout')
            redirect('/dashboard')
        } else {
            // Email confirmation required
            redirect('/login?message=Please check your email to confirm your account')
        }
    }

    // Fallback
    redirect('/login?error=Authentication failed. Please try again.')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}
