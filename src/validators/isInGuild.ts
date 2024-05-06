import { createValidator } from "@/util/validator"

export default createValidator(async ctx => {
  if (!ctx.i.guildId) {
    ctx.reply.error("Please use this command in a server.")
    return false
  }
  return true
})