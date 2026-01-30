'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CodeSchema = z.object({
  landing_page_tsx: z.string(),
  dashboard_core_tsx: z.string().describe("Le code React du Dashboard fonctionnel avec gestion d'état."),
  server_actions_ts: z.string().describe("La logique serveur (Prisma) pour faire fonctionner le dashboard."),
})

export async function generateFullSaaSCode(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  const strategy = project.strategy as any
  const schema = project.schema // Le plan de l'Architecte

  console.log("🚀 Génération du Cœur Métier pour :", project.name)

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: CodeSchema,
      system: `
        ROLE: Tu es un expert Full-Stack Next.js 15.
        MISSION: Générer le code complet pour le SaaS "${project.name}".
        STACK: Tailwind, Shadcn UI, Lucide, Prisma, Server Actions.
        
        CONSIGNES :
        1. LANDING PAGE : Design pro, liens vers /login.
        2. DASHBOARD CORE : Une page qui affiche les données (ex: drones) et permet d'en ajouter via un formulaire intégré ou une modale. Doit être élégant.
        3. SERVER ACTIONS : Fonctions exportées pour lire et écrire dans les tables définies dans ce schema Prisma : ${schema}.
        
        IMPORTANT: Le code doit être complet, sans commentaires "ajoutez votre logique ici".
      `,
      prompt: `Produis le code pour : ${JSON.stringify(strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}