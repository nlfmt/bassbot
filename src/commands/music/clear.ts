import requireQueue from "@/middlewares/requireQueue"
import { createCommand } from "@/util/command"

export default createCommand({
  description: "Remove all songs from the queue",
  middleware: requireQueue,

  run: async ({ reply, data: { player } }) => {
    player.clear()
    return reply("Removed all songs from the queue")
  },
})
