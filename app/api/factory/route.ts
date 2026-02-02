import { NextResponse } from "next/server"
import { generateStrategy } from "@/app/actions/ai-strategist"
import { generateArchitecture } from "@/app/actions/ai-architect"
import { generateFullSaaSCode } from "@/app/actions/ai-coder" // Correction de l'import ici
import { repairCode } from "@/app/actions/ai-coder"

const FACTORY_SECRET = process.env.FACTORY_SECRET

export async function POST(req: Request) {
  // 1. Sécurité
  const authHeader = req.headers.get("x-factory-secret")
  if (authHeader !== FACTORY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { step, payload } = body
  const SYSTEM_ID = "CLI-MASTER-USER"

  try {
    switch (step) {
      case "INIT":
        // Étape 1 : Stratégie & Création du projet en DB
        const stratRes = await generateStrategy(payload.idea, SYSTEM_ID)
        return NextResponse.json(stratRes)

      case "ARCHITECT":
        // Étape 2 : Schéma Prisma & User Stories
        const archRes = await generateArchitecture(payload.projectId)
        return NextResponse.json(archRes)

      case "BUILD_ALL":
        // Étape 3 : Génération du code complet (Landing + Dashboard + Actions)
        const fullRes = await generateFullSaaSCode(payload.projectId)
        return NextResponse.json(fullRes)

      case "REPAIR":
        const repairRes = await repairCode(payload.projectId, payload.errorLog, payload.fileName)
        return NextResponse.json(repairRes)

      default:
        return NextResponse.json({ error: "Unknown step: " + step }, { status: 400 })
    }
  } catch (error: any) {
    console.error("❌ Factory Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}