import type { BassBot } from "@/bot"
import logger from "@/util/logger"

export const setupLavalinkEvents = ({ lava }: BassBot) => {
  lava.on("ready", (name) => {
    logger.info(`Lavalink Node ${name} is ready!`)
  })
  lava.on("error", (name, error) => {
    logger.warn(`Lavalink Node ${name} emitted an error: ${JSON.stringify(error, null, 2)}`)
  })
  lava.on("close", (name, code, reason) => {
    logger.info(`Lavalink Node ${name} closed with code ${code} because of reason: ${reason}`)
  })
  lava.on("disconnect", (name, reason) => {
    logger.warn(`Lavalink Node ${name} disconnected because of ${reason}`)
  })
  lava.on("reconnecting", (name, tries) => {
    logger.info(`Lavalink Node ${name} is trying to reconnect. ${tries} Tries left.`)
  })
}
