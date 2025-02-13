import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand, buildOptions } from "@/util/command"

export default createCommand({
  description: "Plays the next song in the queue",
  options: buildOptions()
    .integer({
      name: "position",
      description: "The position in the queue to skip to",
      minValue: 1,
    })
    .build(),
  allowButtons: true,
  middleware: requirePlayer,

  run: async ({ options, reply, data: { player } }) => {
    await player.next(options.position)
    return reply("Playing next song.")
  },
})
