import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand, buildOptions } from "@/util/command"
import { Timestamp } from "@/util/time"

export default createCommand({
  description: "Seek to the specified time in the current song",
  options: buildOptions()
    .string({
      name: "time",
      description: "The time to seek to in format X:XX",
      required: true,
    })
    .build(),
  middleware: requirePlayer,

  run: async ({ options, reply, data: { player } }) => {
    const info = player.current?.info
    if (!info?.isSeekable) return reply.warn("This track is not seekable")
    console.log(info)

    const { success, value: duration, error } = Timestamp.from(options.time)
    if (!success) return reply.warn(error)

    if (duration.asMillis() > info.length) {
      return reply.warn(`Track is only ${Timestamp.fromMillis(info.length)} long`)
    }

    await player.seekTo(duration.asMillis())

    return reply(`Seeked to ${duration}`)
  },
})
