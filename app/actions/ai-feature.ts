'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

// L'Agent doit rendre deux fichiers distincts et des instructions
const FeatureCodeSchema = z.object({
  server_action_ts: z.string().describe("Le code TypeScript du Server Action ('use server'). Doit inclure la validation Zod et l'appel Prisma."),
  component_tsx: z.string().describe("Le code du composant React (Client Component) qui utilise ce Server Action."),
  instructions: z.string().describe("Instructions très courtes (ex: 'Crée le fichier app/actions/chat.ts et components/chat-form.tsx')")
})

export async function generateFeatureCode(projectId: string, featureTitle: string, featureDescription: string) {
  // 1. Récupérer le contexte du projet
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  console.log(`⚙️ Agent Builder activé pour : ${featureTitle}`)

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: FeatureCodeSchema,
      system: `
        ROLE: Tu es un Senior Fullstack Developer expert en Next.js 15.
        CONTEXTE: Tu dois implémenter une fonctionnalité précise pour un SaaS existant.
        STACK: Prisma (DB), Supabase (Auth), Shadcn UI (Components), Tailwind, Server Actions, Zod.
        
        INPUT:
        - Schema DB existant: ${project.schema}
        - Feature à coder: ${featureTitle}
        - Détails: ${featureDescription}
        
        RÈGLES BACKEND (server_action_ts):
        - Commence par 'use server'.
        - Utilise 'zod' pour valider les données.
        - Utilise 'prisma' (importé depuis @/lib/prisma) pour la DB.
        - Gère les erreurs try/catch et retourne {success: boolean, error?: string}.
        - Vérifie l'auth user via Supabase si nécessaire.
        
        RÈGLES FRONTEND (component_tsx):
        - Commence par 'use client'.
        - Utilise les composants UI de base (suppose qu'ils existent dans @/components/ui/...).
        - Gère l'état de chargement (isPending).
        - Affiche un feedback (alert ou toast) après l'action.
      `,
      prompt: "Génère le code production-ready pour cette fonctionnalité.",
    })

    return { success: true, data: object }
  } catch (error) {
    console.error("❌ Erreur Feature Builder:", error)
    return { success: false, error: "L'IA n'a pas réussi à coder la feature." }
  }
}