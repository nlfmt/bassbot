import { createCommand, buildOptions } from "@/util/command"
import { cleanTrackTitle } from "@/util/helpers"
import logger from "@/util/logger"
import isBoundChannel from "@/validators/isBoundChannel"
import isInBoundVC from "@/validators/isInBoundVC"
import { LoadType } from "shoukaku"

export default createCommand({
  description: "Play a song.",
  options: buildOptions()
    .string({
      name: "song",
      description: "The name/url of the song to play.",
      required: true,
    })
    .boolean({
      name: "next",
      description: "Play as next song",
    })
    .build(),

  validators: [isBoundChannel(), isInBoundVC()],

  run: async ({ i, bot, reply, options }) => {
    await i.deferReply()

    const player = bot.getPlayer(i.guildId) ?? (await bot.joinVC(i))
    const connection = bot.lava.connections.get(i.guildId)

    // Check for existing player
    if (connection?.channelId && connection.channelId !== i.member.voice.channelId!) {
      return reply.error(`Already playing music in <#${connection.channelId}>`)
    }

    const query = options.song.startsWith("http") ? options.song : `ytsearch:${options.song}`

    const result = await player.node.rest.resolve(query)
    if (!result) return reply.error("No results found.")

    switch (result.loadType) {
      case LoadType.EMPTY:
        return reply.error("No results found.")

      case LoadType.ERROR: {
        logger.warn(`Song search error: ${JSON.stringify(result.data, null, 2)}`)
        return reply.error("An error occurred while searching.")
      }

      case LoadType.TRACK: {
        player.addTrack(result.data, options.next ?? false)
        return reply(`Queued **${cleanTrackTitle(result.data)}** by **${result.data.info.author}**`)
      }

      case LoadType.PLAYLIST: {
        player.addTracks(result.data.tracks, options.next ?? false)
        return reply(
          `Queued **${result.data.tracks.length}** songs from **[${result.data.info.name}](${query})** to the queue`
        )
      }

      case LoadType.SEARCH: {
        const track = result.data[0]!
        player.addTrack(track, options.next ?? false)
        return reply(`Queued **${cleanTrackTitle(track)}** by **${track.info.author}**`)
      }
    }
  },
})
