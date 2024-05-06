import { createMiddleware } from "@/util/middleware"
import db from "@/util/db"

export default createMiddleware(async ({ i }) => {
  let guildOpts = await db.guildOptions.find({
    guildId: i.guild.id,
  })
  if (!guildOpts) {
    guildOpts = await db.guildOptions.create({
      guildId: i.guild.id,
    })
  }
  return { guildOpts }
})
