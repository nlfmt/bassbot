import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand } from "@/util/command"

export default createCommand({
  description: "Pauses the player",
  allowButtons: true,

  middleware: m => m.use(requirePlayer),

  run: async ({ reply, data: { player } }) => {
    const newState = !player.paused
    await player.setPaused(newState)
    await reply(newState ? "Paused." : "Resumed.")
  },
})
