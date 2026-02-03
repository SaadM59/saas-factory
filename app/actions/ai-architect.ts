'use server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SchemaMetadata = z.object({
  models: z.array(z.object({
    name: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(["String", "Int", "Float", "Boolean", "DateTime"]),
      isRelation: z.boolean()
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
      system: `Tu es un Architecte de Données. Ne génère PAS le modèle User.`,
      prompt: `Génère les modèles pour : ${JSON.stringify(project.strategy)}`,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { schema: JSON.stringify(object.models) }
    })

    return { success: true, data: object } // On renvoie l'objet directement
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}