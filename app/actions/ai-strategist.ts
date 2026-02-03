'use server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateStrategy(userIdea: string, systemUserId?: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      project_name: z.string(),
      viability_score: z.number(),
      unfair_advantage: z.string().describe("Pourquoi ce SaaS va écraser la concurrence"),
      killer_features: z.array(z.object({
        name: z.string(),
        description: z.string(),
        logic_complexity: z.string().describe("Ce que le code doit calculer ou transformer")
      })).length(3),
      monetization: z.string(),
      target_persona: z.string()
    }),
    system: `Tu es un Partner Senior chez Y Combinator. Ton but est de transformer une idée simple en une machine à cash hautement différenciée.
             RÈGLE : Interdiction de proposer des fonctionnalités génériques (ex: 'un tableau de bord'). 
             PROPOSE : Des moteurs d'IA, des systèmes de score, des automatisations de workflows complexes ou des insights prédictifs.`,
    prompt: `Idée brute : ${userIdea}`,
  })

  const saved = await prisma.project.create({
    data: { userId: systemUserId || "anonymous", name: object.project_name, strategy: object as any }
  })
  return { success: true, data: object, projectId: saved.id }
}