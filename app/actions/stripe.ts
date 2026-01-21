'use server'

import { redirect } from 'next/navigation'
import Stripe from 'stripe'

export async function createCheckoutSession(email: string, userId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe Secret Key missing')
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    metadata: {
      userId: userId, // On attache l'ID de l'user pour le retrouver après
    },
    line_items: [
      {
        // On crée un produit à la volée pour le test
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Abonnement PRO (SaaS Factory)',
            description: 'Accès illimité à l\'usine.',
          },
          unit_amount: 1999, // 19.99 EUR (en centimes)
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
  })

  if (!session.url) {
    throw new Error('Erreur création session Stripe')
  }

  redirect(session.url)
}