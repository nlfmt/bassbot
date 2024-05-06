import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand } from "@/util/command"
import isBoundChannel from "@/validators/isBoundChannel"
import isInBoundVC from "@/validators/isInBoundVC"

export default createCommand({
  description: "Stops the player and quits the voice channel",
  validators: [isBoundChannel(), isInBoundVC()],
  middleware: requirePlayer,

  run: async ({ reply, data: { player } }) => {
    await player.disconnect()
    return reply("Stopped the music")
  },
})
