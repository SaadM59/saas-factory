'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Définition d'un schéma de données simplifié que l'IA ne peut pas rater
const SchemaMetadata = z.object({
  models: z.array(z.object({
    name: z.string().describe("Nom du modèle (ex: Invoice)"),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(["String", "Int", "Float", "Boolean", "DateTime"]),
      required: z.boolean(),
      isRelation: z.boolean().default(false),
      relationModel: z.string().optional().describe("Si relation, nom du modèle cible")
    }))
  })),
  user_stories: z.array(z.object({ title: z.string(), description: z.string() }))
})

export async function generateArchitecture(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: SchemaMetadata,
      system: `Tu es un Architecte de Données. Tu dois définir la structure d'un SaaS.
               RÈGLE : Ne t'occupe pas du modèle User, il est déjà géré par le système.
               Génère uniquement les modèles spécifiques au métier (ex: Invoices, Tasks, Drones).`,
      prompt: `Génère les modèles pour ce SaaS : ${JSON.stringify(project.strategy)}`,
    })

    // On stocke le JSON dans le champ schema au lieu du texte
    await prisma.project.update({
      where: { id: projectId },
      data: { schema: JSON.stringify(object.models) }
    })

    return { success: true, data: { models: object.models, user_stories: object.user_stories } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}