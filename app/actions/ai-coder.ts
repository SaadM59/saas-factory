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
        feature_config: z.object({
          entity_name: z.string().describe("Nom de l'objet à créer (ex: Facture)"),
          form_fields: z.array(z.object({
            name: z.string(),
            label: z.string(),
            type: z.enum(["text", "number", "date"])
          })),
          table_columns: z.array(z.string())
        }),
        business_logic: z.string().describe("Le code des Server Actions (create, delete, list) utilisant Prisma.")
      }),
      system: `Tu es l'ingénieur système de "${project.name}". 
               LOGIQUE : Utilise les modèles Prisma définis : ${project.schema}.
               Génère les champs de formulaire correspondants aux modèles.`,
      prompt: `Génère le moteur métier pour : ${JSON.stringify(project.strategy)}`,
    })
    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}