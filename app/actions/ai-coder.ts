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
        marketing: z.object({
          hero_title: z.string(),
          hero_subtitle: z.string(),
          features: z.array(z.object({ title: z.string(), desc: z.string() })),
        }),
        dashboard: z.object({
          stat_cards: z.array(z.object({ label: z.string(), value: z.string() })),
          table_name: z.string(),
          columns: z.array(z.string()),
        }),
        business_logic: z.string().describe("Le code des Server Actions Prisma pour gérer les données (sans imports).")
      }),
      system: `Tu es le moteur de données du SaaS "${project.name}".
               Génère le contenu marketing et la logique serveur.
               REGLÈS :
               - Utilise uniquement les modèles Prisma définis : ${project.schema}
               - Ne génère aucun import, juste les fonctions exportées.`,
      prompt: `Génère la substance métier pour : ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}