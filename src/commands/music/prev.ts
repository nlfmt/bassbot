import requireHistory from "@/middlewares/requireHistory"
import { createCommand } from "@/util/command"
import isInGuild from "@/validators/isInGuild"

export default createCommand({
  description: "Plays the previous song in the queue",
  validators: [isInGuild()],
  allowButtons: true,
  middleware: requireHistory,
  
  run: async ({ reply, data: { player } }) => {
    await player.prev()
    return reply("Playing previous song.")
  },
})
