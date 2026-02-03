'use server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateFullSaaSCode(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Introuvable" }

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      marketing: z.any(),
      dashboard: z.object({
        smart_widgets: z.array(z.object({ title: z.string(), value: z.string(), trend: z.string() })),
        main_tool: z.object({
          title: z.string(),
          action_label: z.string(),
          form_fields: z.array(z.object({ name: z.string(), label: z.string(), type: z.string() }))
        }),
        ai_insight_placeholder: z.string().describe("Un texte d'analyse IA pour le dashboard")
      }),
      server_logic: z.string().describe("Code TypeScript exportant des fonctions asynchrones (createRecord, calculateInsights, runAIAnalysis) utilisant Prisma.")
    }),
    system: `Tu es un Lead Developer. Tu dois coder le 'MOTEUR' du SaaS. 
             SCHEMA DB : ${project.schema}
             MISSION : Écris une logique qui ne se contente pas de sauvegarder. Elle doit transformer les données (ex: calculer un score de santé financière, générer un texte de relance automatique).
             ZÉRO PLACEHOLDER. Code complet.`,
    prompt: `Construis la logique métier pour : ${JSON.stringify(project.strategy)}`,
  })

  return { success: true, data: object }
}