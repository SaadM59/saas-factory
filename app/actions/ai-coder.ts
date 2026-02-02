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
        dashboard_content_tsx: z.string().describe("Le contenu INTERNE du dashboard (pas le layout)."),
        server_actions_ts: z.string(),
      }),
      system: `
        ROLE: Expert Full-Stack spécialisé en SaaS B2B.
        MISSION: Générer le CŒUR OPÉRATIONNEL du SaaS "${project.name}".
        
        RÈGLES :
        1. Tu travailles à l'intérieur d'un Layout PROFESSIONNEL déjà existant.
        2. Ne génère que le contenu utile : Un tableau de bord riche, des statistiques (Cards), et un tableau (Table) pour gérer les données.
        3. DESIGN : Utilise des couleurs sombres (Slate/Zinc), des bordures fines et un espacement généreux.
        4. ACTIONS : Implémente la logique Prisma pour : ${project.schema}
      `,
      prompt: `Stratégie : ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}