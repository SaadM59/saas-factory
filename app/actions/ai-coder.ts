'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateFullSaaSCode(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { success: false, error: "Projet introuvable" }

  const schema = project.schema // Les modèles générés par l'Architecte

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        landing_page_tsx: z.string(),
        dashboard_core_tsx: z.string(),
        server_actions_ts: z.string(),
      }),
      system: `
        ROLE: Expert Senior Full-Stack Next.js 15.
        MISSION: Générer une application SaaS COMPLÈTE et OPÉRATIONNELLE pour "${project.name}".
        
        RÈGLES D'OR (ZÉRO PLACEHOLDER) :
        1. LE DASHBOARD DOIT CONTENIR :
           - Un tableau (Table) qui affiche les données réelles récupérées via une Server Action.
           - Un bouton "Ajouter [Entité]" qui ouvre un formulaire ou une modale.
           - Des statistiques en haut de page (Sommes, Compteurs).
        
        2. LA LOGIQUE SERVEUR (Actions) :
           - Tu dois écrire les fonctions 'getData' et 'createData' en utilisant Prisma et le schéma suivant : ${schema}.
           - Utilise 'revalidatePath' pour mettre à jour l'UI après un ajout.
        
        3. DESIGN :
           - Utilise les composants Shadcn : Table, Card, Button, Input, Dialog/Modal.
           - Design professionnel, espacé, type "Dashboard Enterprise".
      `,
      prompt: `Construis le SaaS complet basé sur cette stratégie : ${JSON.stringify(project.strategy)}`,
    })

    return { success: true, data: object }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}