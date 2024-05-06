import requireQueue from "@/middlewares/requireQueue"
import { createCommand } from "@/util/command"

export default createCommand({
  description: "Shuffles the queue",
  middleware: requireQueue,

  run: async ({ reply, data: { player } }) => {
    player.shuffle()
    return reply("Shuffled the queue.")
  },
})
