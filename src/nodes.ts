import path from "node:path"
import { z } from "zod"
import { generateErrorMessage } from "zod-error"

const nodeOptionSchema = z.array(
  z.object({
    name: z.string(),
    url: z.string(),
    auth: z.string(),
    secure: z.boolean().optional(),
    group: z.string().optional(),
  }),
)

async function loadNodes() {
  const defPath = path.join(import.meta.dir, "..", "nodes.json")
  const file = Bun.file(defPath)

  if (!await file.exists()) return []

  const nodes = await file.json()
  const parsed = nodeOptionSchema.safeParse(nodes)

  if (!parsed.success) {
    console.error("\n❌ Invalid node definition:")
    console.error(generateErrorMessage(parsed.error.issues))
    console.error("\n")
    process.exit(1)
  }

  return parsed.data
}

export default await loadNodes()
