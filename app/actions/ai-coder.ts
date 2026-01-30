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
        ROLE: Senior Frontend Engineer.
        STACK: Next.js 15, Tailwind, Shadcn UI, Lucide React.
        
        RÈGLE CRITIQUE DES IMPORTS (SHADCN) :
        - INTERDIT : import { Button } from "@shadcn/ui" ou "@shadcn/components"
        - OBLIGATOIRE : import { Button } from "@/components/ui/button"
        - OBLIGATOIRE : import { Input } from "@/components/ui/input"
        - OBLIGATOIRE : import { Card, CardHeader, ... } from "@/components/ui/card"
        
        CONSIGNES :
        1. LANDING PAGE : Design haut de gamme.
        2. DASHBOARD : Dashboard fonctionnel pour "${project.name}".
        3. ACTIONS : Logique Prisma complète.
      `,
      prompt: `Produis le code pour : ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}