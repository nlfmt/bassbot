import requireQueue from "@/middlewares/requireQueue"
import { createCommand, buildOptions } from "@/util/command"
import { cleanTrackTitle } from "@/util/helpers"
import { duration } from "@/util/message"

export default createCommand({
  description: "View a list of songs in the queue",
  options: buildOptions()
    .integer({
      name: "page",
      description: "Displays the tracks in queue",
    })
    .build(),
  middleware: requireQueue,

  run: async ({ i, options, reply, data: { player } }) => {

    const page = options.page ?? 1
    const maxPage = Math.ceil(player.queue.length / 10)
    if (page && page > maxPage)
      return reply.warn(
        `Page ${page} does not exist, there ${maxPage == 1 ? "is" : "are"} only ${maxPage} page${
          maxPage == 1 ? "" : "s"
        }.`
      )

    const tracksToShow = [player.current, ...player.queue].slice(10 * (page - 1), 10 * page)
    const rickroll = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    await reply("Getting song data...")

    const description = tracksToShow
      .map((song, index) => {
        let label = page == 1 ? (index == 0 ? "▸" : index) : 10 * (page - 1) + index + 1
        if (page != 1 || index != 0) label += ":"

        if (!song) return "No song playing"
        return `${label} [**${cleanTrackTitle(song)}** - ${song.info.author}](${song.info.uri || rickroll})`
      })
      .join("\n")

    await i.editReply({
      content: null,
      embeds: [
        {
          title: player.queue.length + " songs, " + duration(player.getQueueDuration() / 1000) + " playtime",
          description,
          footer: {
            text: "Page  " + page + "  of  " + maxPage,
          },
        },
      ],
    })
  },
})
