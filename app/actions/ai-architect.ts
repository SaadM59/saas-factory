'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateArchitecture(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        models: z.array(z.object({
          name: z.string(),
          fields: z.array(z.object({
            name: z.string(),
            type: z.enum(["String", "Int", "Float", "Boolean", "DateTime"])
          }))
        })),
        user_stories: z.array(z.object({ title: z.string(), description: z.string() }))
      }),
      system: `Tu es un expert en modélisation de données. Génère les modèles métier pour un SaaS. 
               Ignore le modèle 'User', il est déjà géré. Ne génère que les entités spécifiques (ex: Invoice, Client, Item).`,
      prompt: `Génère l'architecture pour ce projet : ${JSON.stringify(project.strategy)}`,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { schema: JSON.stringify(object.models) }
    })

    return { success: true, data: { models: object.models, user_stories: object.user_stories } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}