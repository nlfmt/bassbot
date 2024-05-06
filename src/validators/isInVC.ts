import { createValidator } from "@/util/validator"
import isInGuild from "./isInGuild"

export default createValidator({
  deps: [isInGuild()],

  async validator(ctx) {
    if (!ctx.i.member?.voice.channelId) {
      ctx.reply.warn("You need to be in a voice channel to use this command.")
      return false
    }
    return true
  },
})
