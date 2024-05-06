import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand, buildOptions } from "@/util/command"
import { cleanTrackTitle } from "@/util/helpers"
import { duration } from "@/util/message"
import isBoundChannel from "@/validators/isBoundChannel"

export default createCommand({
  description: "Get information about the current song",
  options: buildOptions()
    .integer({
      name: "position",
      description: "Displays info about the current song",
    })
    .build(),
  validators: [isBoundChannel()],
  middleware: requirePlayer,

  run: async ({ i, options, reply, data: { player } }) => {
    const position = options.position ?? 0
    if (position < 0 || position > player.queue.length)
      return reply.warn("The queue only has " + player.queue.length + " songs.")

    const track = position == 0 ? player.current : player.queue.at(position - 1)
    if (!track) return reply.warn("Not currently playing a song")

    await i.reply({
      embeds: [
        {
          thumbnail: track.info.artworkUrl
            ? {
                url: track.info.artworkUrl,
              }
            : undefined,
          description:
            `\n**[${cleanTrackTitle(track)}](${track.info.uri})**\n` +
            `by ${track.info.author}\n\n` +
            `**Duration:** \`${duration(track.info.length / 1000)}\``,
        },
      ],
    })
  },
})
