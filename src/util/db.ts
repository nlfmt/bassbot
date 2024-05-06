import StormDB, { FileSaveLocation, JsonFile, type DocType } from "@nlfmt/stormdb"
import { z } from "zod"

const models = {
  guildOptions: z.object({
    guildId: z.string(),
    channels: z.array(z.string()).default([]),
  }),
}

export type GuildOptions = DocType<typeof models.guildOptions>

const storage = new JsonFile(
  new FileSaveLocation("db.json", {
    createIfNotExists: true,
  })
)

export default StormDB(models, { storage })
