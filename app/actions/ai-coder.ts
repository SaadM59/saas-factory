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
        dashboard_core_tsx: z.string(),
        server_actions_ts: z.string(),
      }),
      system: `
        ROLE: Senior Frontend Engineer expert en Shadcn UI.
        
        RÈGLE CRITIQUE : Voici les SEULS exports autorisés pour les composants Shadcn. Ne les invente pas.
        - Card : Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent (PAS de CardBody)
        - Button : Button
        - Input : Input
        - Label : Label

        IMPORT RÈGLE : Utilise TOUJOURS '@/components/ui/nom-du-composant'
        Exemple : import { Card, CardContent } from "@/components/ui/card"

        CONSIGNES :
        1. LANDING PAGE : Moderne, épurée, texte sombre sur fond clair.
        2. DASHBOARD : Utilise des Card et CardContent pour structurer les données.
      `,
      prompt: `Produis le code pour : ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}