'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("❌ ERREUR SIGNUP:", error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // --- AJOUT ICI ---
  // On envoie l'email. On met 'await' pour être sûr que ça part avant la redirection
  // (En Vercel Pro, on utiliserait waitUntil, mais restons simples)
  await sendWelcomeEmail(data.email)
  // -----------------

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // On s'inscrit
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("❌ ERREUR SIGNUP:", error.message) // On affiche l'erreur
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}