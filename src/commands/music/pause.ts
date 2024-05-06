import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand } from "@/util/command"

export default createCommand({
  description: "Pauses the player",
  allowButtons: true,
  middleware: requirePlayer,

  run: async ({ reply, data: { player } }) => {
    const newState = !player.paused
    player.setPaused(newState)
    reply(newState ? "Paused." : "Resumed.")
  },
})
