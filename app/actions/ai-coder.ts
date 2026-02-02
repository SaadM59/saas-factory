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
        landing_page_tsx: z.string(),
        dashboard_inner_tsx: z.string(),
        server_actions_ts: z.string(),
      }),
      system: `
        ROLE: Expert Full-Stack Next.js.
        
        RÈGLES D'OR SUR LES ACTIFS :
        1. INTERDIT d'importer des images locales (ex: ./logo.svg, ./hero.png).
        2. INTERDIT d'utiliser des composants de type 'Image' de Next.js si la source est locale.
        3. OBLIGATOIRE : Utilise uniquement 'lucide-react' pour tout ce qui est visuel (icones).
        4. Pour le logo, écris simplement le nom du projet en texte gras avec une icône Lucide à côté.

        RÈGLES DE STRUCTURE :
        - Dashboard : Tableau (Table) et Cartes (Card) pour les données métier.
        - Actions : Logique complète pour Prisma : ${project.schema}
      `,
      prompt: `Génère le code complet pour : ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}