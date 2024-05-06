import env from "@/env"
import { BassBot } from "@/bot"
import { setupLavalinkEvents } from "./events/lavalink-events"
import logger from "./util/logger"

const bot = new BassBot()

bot.on("ready", async ({ user }) => {
  logger.info("Logged in as " + user.displayName)

  setupLavalinkEvents(bot)
})

bot.login(env.TOKEN)

process.on("unhandledRejection", (error) => {
  logger.error("UNHANDLED", JSON.stringify(error, null, 2))
})
