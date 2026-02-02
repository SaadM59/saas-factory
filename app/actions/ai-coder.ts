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
          features: z.array(z.object({ title: z.string(), desc: z.string(), icon: z.string() })),
          pricing_plans: z.array(z.object({ name: z.string(), price: z.string(), features: z.array(z.string()) }))
        }),
        dashboard_config: z.object({
          stats: z.array(z.object({ label: z.string(), value: z.string() })),
          table_columns: z.array(z.string()),
          primary_action_label: z.string()
        }),
        server_logic_raw: z.string().describe("Le code des Server Actions pour gérer le métier.")
      }),
      system: `Tu es le moteur de données d'un SaaS. Tu ne génères PAS d'UI. Tu génères le CONTENU et la LOGIQUE.`,
      prompt: `Projet: ${project.name}. Stratégie: ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}