'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function repairCode(projectId: string, errorLog: string, fileName: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        fixed_code: z.string().describe("Le code complet corrigé du fichier."),
        explanation: z.string().describe("Pourquoi ça a planté et comment j'ai réparé.")
      }),
      system: `
        ROLE: Senior Debugger Expert.
        MISSION: Réparer l'erreur de compilation suivante sur ton Mac.
        LOG D'ERREUR : ${errorLog}
        FICHIER À RÉPARER : ${fileName}
        
        CONSIGNES :
        - Si un module Shadcn est manquant, assure-toi que l'import est '@/components/ui/...'
        - Si c'est une erreur de Link, importe 'next/link'.
        - Ne renvoie QUE du code valide.
      `,
      prompt: `Répare le fichier ${fileName} pour le projet ${project.name}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// On garde generateFullSaaSCode mais on le rend plus strict sur les imports
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
        ROLE: Senior Full-Stack Engineer.
        RÈGLE D'OR : Utilise UNIQUEMENT '@/components/ui/...' pour Shadcn. Jamais '@shadcn/...'.
        STRICT : N'oublie pas 'use client' si tu utilises des hooks React.
      `,
      prompt: `Génère le code complet pour : ${JSON.stringify(project.strategy)}`,
    })
    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}