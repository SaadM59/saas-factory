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
        prisma_models: z.string().describe("UNIQUEMENT les blocs 'model' Prisma. INTERDIT d'inclure datasource ou generator."),
        user_stories: z.array(z.object({ title: z.string(), description: z.string() }))
      }),
      system: `
        ROLE: Tu es un générateur de Schéma Prisma pur.
        MISSION: Générer les modèles pour "${project.name}".
        
        RÈGLE ABSOLUE : 
        1. Tu dois commencer par le modèle User EXACTEMENT comme ceci :
           model User {
             id        String   @id @default(uuid())
             email     String   @unique
             name      String?
             createdAt DateTime @default(now())
             updatedAt DateTime @updatedAt
           }
        2. Ajoute ensuite les autres modèles (Invoices, Drones, etc.) avec leurs relations vers User.
        3. NE GÉNÈRE QUE LES MODÈLES. Pas de code TypeScript, pas de texte, pas de bloc config.
      `,
      prompt: `Génère les modèles Prisma pour cette stratégie : ${JSON.stringify(project.strategy)}`,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { schema: object.prisma_models }
    })

    return { success: true, data: { prisma_schema: object.prisma_models, user_stories: object.user_stories } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}