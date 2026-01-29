import { NextResponse } from "next/server"
import { generateStrategy } from "@/app/actions/ai-strategist"
import { generateArchitecture } from "@/app/actions/ai-architect"
import { generateLandingPage } from "@/app/actions/ai-coder"

const FACTORY_SECRET = process.env.FACTORY_SECRET

export async function POST(req: Request) {
  const authHeader = req.headers.get("x-factory-secret")
  if (authHeader !== FACTORY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { step, payload } = body
  const SYSTEM_ID = "CLI-MASTER-USER" // L'ID propriétaire des projets CLI

  try {
    switch (step) {
      case "INIT":
        // On passe SYSTEM_ID en 2ème argument
        const stratRes = await generateStrategy(payload.idea, SYSTEM_ID)
        return NextResponse.json(stratRes)

      case "ARCHITECT":
        const archRes = await generateArchitecture(payload.projectId)
        return NextResponse.json(archRes)

      case "CODE_LANDING":
        const codeRes = await generateLandingPage(payload.projectId)
        return NextResponse.json(codeRes)

      default:
        return NextResponse.json({ error: "Unknown step" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("❌ Factory Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}