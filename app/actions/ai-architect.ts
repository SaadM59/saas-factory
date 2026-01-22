'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Structure de sortie de l'Architecte
const ArchitectureSchema = z.object({
  prisma_schema: z.string().describe("Le code Prisma Schema complet pour ce projet"),
  user_stories: z.array(z.object({
    title: z.string(),
    description: z.string(),
    acceptance_criteria: z.array(z.string())
  })).describe("Liste des user stories techniques"),
  api_routes: z.array(z.string()).describe("Liste des routes API nécessaires (ex: /api/cron)"),
})

export async function generateArchitecture(projectId: string) {
  'use server'
  
  // 1. Récupérer la stratégie existante
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !project.strategy) return { success: false, error: "Projet introuvable" }

  const strategy = project.strategy as any

  console.log("🏗️ Agent Architect activé pour :", project.name)

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: ArchitectureSchema,
      system: `
        ROLE: Tu es un Architecte Technique Senior expert en Next.js 15, Prisma et Supabase.
        INPUT: Une stratégie produit validée.
        MISSION: Produire les spécifications techniques exécutables.
        
        RÈGLES PRISMA:
        - Utilise toujours des UUID pour les ID (@id @default(uuid())).
        - Ajoute toujours createdAt/updatedAt.
        - Ne réinvente pas User (suppose qu'il existe déjà lié à Supabase Auth).
        
        RÈGLES USER STORIES:
        - Sois technique et précis.
      `,
      prompt: `Génère l'architecture pour ce projet : ${JSON.stringify(strategy)}`,
    })

    // 2. Sauvegarde du résultat
    await prisma.project.update({
      where: { id: projectId },
      data: {
        schema: object.prisma_schema,
        prd: JSON.stringify(object.user_stories) // On stocke les stories comme PRD simple
      }
    })

    return { success: true, data: object }
  } catch (error) {
    console.error("❌ Erreur Architecte:", error)
    return { success: false, error: "Échec génération architecture" }
  }
}