'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

// On attend juste une string géante contenant le code
const CodeSchema = z.object({
  landing_page_tsx: z.string().describe("Le code React complet (Next.js) pour la landing page."),
  explanation: z.string().describe("Courte explication des choix de design."),
})

export async function generateLandingPage(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !project.strategy) return { success: false, error: "Projet introuvable" }

  const strategy = project.strategy as any
  // On ne charge pas tout le PRD pour économiser des tokens, la stratégie suffit pour la Landing

  console.log("🎨 Agent Coder (Landing) activé pour :", project.name)

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: CodeSchema,
      system: `
        ROLE: Tu es un Expert Frontend React/Next.js spécialisé en Conversion Rate Optimization (CRO).
        STACK: Next.js 15, Tailwind CSS, Lucide React (Icons).
        MISSION: Coder la Landing Page parfaite pour ce SaaS.
        
        RÈGLES DE CODE :
        1. Tout le code doit tenir dans UN SEUL fichier (export default function LandingPage...).
        2. Utilise 'lucide-react' pour les icônes.
        3. Design : Moderne, aéré, "Stripe-like" ou "Bento-grid".
        4. Structure :
           - Hero Section (H1 percutant basé sur la stratégie, CTA "Get Started")
           - Features Grid (basé sur les MVP features)
           - Pricing Section (basé sur la stratégie de monétisation)
           - Footer simple.
        5. N'invente pas d'images. Utilise des placeholders colorés ou des icônes.
        6. Le texte doit être Vendeur (Copywriting persuasif).
      `,
      prompt: `Génère le code TSX de la Landing Page pour ce projet : 
               Nom: ${project.name}
               Pitch: ${strategy.brutal_feedback}
               Cible: ${strategy.target_persona}
               Pricing: ${strategy.monetization}
               Features: ${JSON.stringify(strategy.mvp_features)}`,
    })

    // Sauvegarde
    await prisma.project.update({
      where: { id: projectId },
      data: { landingPageCode: object.landing_page_tsx }
    })

    return { success: true, data: object }
  } catch (error) {
    console.error("❌ Erreur Coder:", error)
    return { success: false, error: "Échec génération code" }
  }
}