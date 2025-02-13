import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand, buildOptions } from "@/util/command"
import { cleanTrackTitle } from "@/util/helpers"
import { duration } from "@/util/time"
import { Message } from "discord.js"

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
    const rickroll = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    let msg: Message<true> | undefined = undefined
    if (i.isButton()) {
      await i.deferUpdate()
      console.log("sending separate message, because trigger is button")
      msg = await i.channel?.send({ reply: { messageReference: i.message.id }, content: "Getting song data..." })
    } else {
      await reply("Getting song data...")
    }

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
          title: player.queue.length + " songs, " + duration(player.getQueueDuration() / 1000) + " playtime",
          description,
          footer: {
            text: "Page  " + page + "  of  " + maxPage,
          },
        },
      ],
    }

    if (msg) {
      await msg.edit(content)
    } else {    
      await i.editReply(content)
    }
  },
})
