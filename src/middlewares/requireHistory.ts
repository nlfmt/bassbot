import { createMiddleware } from "@/util/middleware"

export default createMiddleware(async ({ i, bot }, abort) => {
  const player = bot.getPlayer(i.guildId)

  if (!player) return abort.warn("There is no music playing")
  if (!player.history.length) return abort.warn("There are no songs in the history.")

  return { player }
})
