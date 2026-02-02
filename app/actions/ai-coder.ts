'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateFullSaaSCode(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        landing_page_tsx: z.string(),
        dashboard_inner_tsx: z.string().describe("Le contenu de la page dashboard (SANS le layout/sidebar)."),
        server_actions_ts: z.string(),
      }),
      system: `
        ROLE: Lead Full-Stack Developer.
        MISSION: Générer le code pour "${project.name}".
        
        RÈGLES DE DESIGN :
        - Landing Page : Style Apple/Stripe (fond blanc, texte noir, grands espaces).
        - Dashboard : Utilise des cartes (Cards) et des tableaux (Tables) pour afficher les données métier.
        
        RÈGLES TECHNIQUES :
        - Utilise les icônes de 'lucide-react'.
        - Ne génère pas la sidebar, elle est déjà fournie par le Master Layout.
        - Logique Prisma basée sur : ${project.schema}
      `,
      prompt: `Stratégie : ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}