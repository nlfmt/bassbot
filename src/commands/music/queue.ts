import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand, buildOptions } from "@/util/command"
import { cleanTrackTitle } from "@/util/helpers"
import { replyEmbed } from "@/util/reply"
import { duration } from "@/util/time"
import { MessageFlags } from "discord.js"

export default createCommand({
  description: "View a list of songs in the queue",
  allowButtons: true,
  options: buildOptions()
    .integer({
      name: "page",
      description: "Displays the tracks in queue",
    })
    .build(),
  middleware: requirePlayer,

  run: async ({ i, options, reply, data: { player } }) => {
    const page = options.page ?? 1
    const maxPage = Math.ceil(player.queue.length / 10) || 1
    if (page && page > maxPage)
      return reply.warn(
        `Page ${page} doesn't exist, queue only has ${maxPage} page${maxPage == 1 ? "" : "s"}`
      )

    const tracksToShow = [player.current, ...player.queue].slice(10 * (page - 1), 10 * page)
    
    if (tracksToShow.length === 0) return reply("No songs in queue")
    const rickroll = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    await replyEmbed(i, "Getting song data...", { flags: MessageFlags.Ephemeral })

    const description = tracksToShow
      .map((song, index) => {
        let label = page == 1 ? (index == 0 ? "▸" : index) : 10 * (page - 1) + index + 1
        if (page != 1 || index != 0) label += ":"

        if (!song) return "No song playing"
        return `${label} [**${cleanTrackTitle(song)}** - ${song.info.author}](${song.info.uri ?? rickroll})`
      })
      .join("\n")

    const content = {
      content: null,
      embeds: [
        {
          title:
            player.queue.length === 0
              ? "No songs in queue"
              : player.queue.length + " songs, " + duration(player.getQueueDuration() / 1000) + " playtime",
          description,
          footer: {
            text: "Page  " + page + "  of  " + maxPage,
          },
        },
      ],
    }

    await i.editReply(content)
  },
})
