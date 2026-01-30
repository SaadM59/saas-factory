'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const ArchitectureSchema = z.object({
  prisma_schema: z.string().describe("Le code Prisma Schema complet."),
  user_stories: z.array(z.object({
    title: z.string(),
    description: z.string(),
    acceptance_criteria: z.array(z.string())
  })),
  api_routes: z.array(z.string()),
})

export async function generateArchitecture(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !project.strategy) return { success: false, error: "Projet introuvable" }

  console.log("🏗️ Agent Architect (V2 Stable) pour :", project.name)

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: ArchitectureSchema,
      system: `
        ROLE: Tu es un Architecte Logiciel expert.
        MISSION: Produire un schéma Prisma PARFAIT.
        
        CONSIGNE CRITIQUE :
        Chaque schéma doit OBLIGATOIREMENT inclure le modèle 'User' suivant pour permettre les relations :
        
        model User {
          id        String   @id @default(uuid())
          email     String   @unique
          name      String?
          createdAt DateTime @default(now())
          updatedAt DateTime @updatedAt
          // Ajoute ici les relations vers tes autres modèles (ex: invoices Invoice[])
        }

        RÈGLES :
        - Utilise des relations @relation pour lier les données à l'utilisateur.
        - Utilise @default(uuid()) pour les IDs.
        - Ne mets PAS de bloc 'datasource' ou 'generator', commence direct aux 'model'.
      `,
      prompt: `Génère l'architecture pour : ${JSON.stringify(project.strategy)}`,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: {
        schema: object.prisma_schema,
        prd: JSON.stringify(object.user_stories)
      }
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}