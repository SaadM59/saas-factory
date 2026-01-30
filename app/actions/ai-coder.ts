'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CodeSchema = z.object({
  landing_page_tsx: z.string().describe("Le code React complet."),
  explanation: z.string().describe("Explication des choix."),
})

export async function generateLandingPage(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !project.strategy) return { success: false, error: "Projet introuvable" }

  const strategy = project.strategy as any

  console.log("🎨 Agent Coder (Landing V2) activé pour :", project.name)

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: CodeSchema,
      system: `
        ROLE: Tu es un Lead Designer & Frontend Engineer (Top 1% Dribbble).
        STACK: Next.js 15, Tailwind CSS, Lucide React.
        
        MISSION: Coder la Landing Page pour "${project.name}".
        
        RÈGLES D'OR (DESIGN & UX):
        1. **CONTRASTE MAXIMAL** : Jamais de texte clair sur fond clair. Utilise 'text-slate-900' ou 'text-gray-800' pour le texte sur fond blanc.
        2. **BOUTONS CLIQUABLES** : Tous les boutons "Call to Action" (Commencer, S'abonner) DOIVENT être entourés d'un composant Link pointant vers '/login'.
           Exemple : <Link href="/login"><Button>Commencer</Button></Link>
        3. **IMPORTS** : N'oublie pas d'importer Link de 'next/link'.
        4. **ESTHÉTIQUE** : Utilise des espacements généreux (py-24), des ombres douces (shadow-xl) et des bordures fines (border-zinc-200).
        5. **HÉROS** : Un titre H1 énorme (text-6xl), centré, avec un sous-titre lisible.
        
        CONTENU:
        - Pitch: ${strategy.brutal_feedback}
        - Features: ${JSON.stringify(strategy.mvp_features)}
        - Pricing: ${strategy.monetization}
      `,
      prompt: "Génère le code complet de la page (export default function LandingPage). Sois créatif mais lisible.",
    })

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