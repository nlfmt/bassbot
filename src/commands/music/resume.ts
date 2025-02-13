import requirePlayer from "@/middlewares/requirePlayer";
import { createCommand } from "@/util/command";

export default createCommand({
  description: "Resume the current song",
  middleware: requirePlayer,
  allowButtons: true,
  run: async ({ reply, data: { player } }) => {
    if (player.paused) {
      await player.setPaused(false)
      return reply("Resumed.")
    } else {
      return reply("Already playing.")
    }
  }
})