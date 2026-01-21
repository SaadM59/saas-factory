import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature") as string

  let event: Stripe.Event

  // 1. Vérification de sécurité (Est-ce vraiment Stripe qui appelle ?)
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // 2. Traitement de l'événement
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    if (!userId) {
      return new NextResponse("User ID missing in metadata", { status: 400 })
    }

    console.log(`💰 Paiement reçu pour l'utilisateur : ${userId}`)

    // 3. Mise à jour de la Base de Données
    await prisma.userProfile.update({
      where: { userId: userId },
      data: {
        tier: "pro",      // On passe en PRO
        credits: 100,     // On donne 100 crédits
      },
    })
  }

  return NextResponse.json({ received: true })
}