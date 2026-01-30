'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Contrat simplifié et STRICT pour éviter tout rejet de l'API
const SchemaMetadata = z.object({
  models: z.array(z.object({
    name: z.string().describe("Nom du modèle (ex: Invoice)"),
    fields: z.array(z.object({
      name: z.string().describe("Nom du champ"),
      type: z.enum(["String", "Int", "Float", "Boolean", "DateTime"]),
      isRelation: z.boolean().describe("True si c'est une relation vers User")
    }))
  })),
  user_stories: z.array(z.object({ 
    title: z.string(), 
    description: z.string() 
  }))
})

export async function generateArchitecture(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'), // Utilisation du mode structuré
      schema: SchemaMetadata,
      system: `Tu es un Architecte de Données expert.
               Génère les modèles de données pour le SaaS. 
               REGLÈS :
               1. Ne génère PAS le modèle User (il est automatique).
               2. Pour chaque modèle, indique 'isRelation: true' seulement si le champ lie le modèle à l'utilisateur owner.`,
      prompt: `Projet: ${project.name}. Stratégie: ${JSON.stringify(project.strategy)}`,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { schema: JSON.stringify(object.models) }
    })

    return { success: true, data: { models: object.models, user_stories: object.user_stories } }
  } catch (error: any) {
    console.error("Détail erreur OpenAI:", error)
    return { success: false, error: error.message }
  }
}