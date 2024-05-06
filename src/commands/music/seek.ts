import requirePlayer from "@/middlewares/requirePlayer"
import { createCommand, buildOptions } from "@/util/command"
import { parseTimestamp } from "@/util/helpers"

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
    if (!player.current?.info.isSeekable) return reply.warn("This track is not seekable")

    const res = parseTimestamp(options.time)
    if (!res.success) return reply.warn("Wrong timestamp format, expected XX:XX")

    await player.seekTo(res.value.millis)

    const mins = res.value.mins.toString().padStart(2, "0")
    const secs = res.value.secs.toString().padStart(2, "0")
    return reply(`Seeked to ${mins}:${secs}`)
  },
})
