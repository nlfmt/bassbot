import { type Awaitable, type ButtonInteraction, type CommandInteraction } from "discord.js"
import { createMessageEmbed, type EmbedOpts } from "./message"

export async function replyEmbed(i: CommandInteraction, msg: string, opts?: EmbedOpts) {
  opts = opts || {}

  if (i.replied || i.deferred) {
    return i.editReply({
      body: null,
      content: null,
      embeds: [createMessageEmbed(msg, opts)],
    })
  } else {
    return i.reply({
      embeds: [createMessageEmbed(msg, opts)],
      flags: opts.flags
    })
  }
}

export async function replyWarn(i: CommandInteraction, msg: string, opts?: EmbedOpts) {
  return replyEmbed(i, msg, { ...opts, color: 0xff8f30, flags: "Ephemeral" })
}

export async function replyError(i: CommandInteraction, msg: string, opts?: EmbedOpts) {
  return replyEmbed(i, msg, { ...opts, color: 0xe25d50, flags: "Ephemeral" })
}

export function createReplyHelper(i: CommandInteraction) {
  const reply = async (msg: string, opts?: EmbedOpts) => {
    return replyEmbed(i, msg, opts)
  }
  reply.error = async (msg: string, opts?: EmbedOpts) => {
    return replyError(i, msg, opts)
  }
  reply.warn = async (msg: string, opts?: EmbedOpts) => {
    return replyWarn(i, msg, opts)
  }
  return reply
}
export type ReplyHelper = ReturnType<typeof createReplyHelper>

export function createAbortHelper(i: CommandInteraction, onAbort: () => void) {
  const abort = async (msg: string, opts?: EmbedOpts) => {
    onAbort()
    replyEmbed(i, msg, opts)
    return null
  }
  abort.error = async (msg: string, opts?: EmbedOpts) => {
    onAbort()
    replyError(i, msg, opts)
    return null
  }
  abort.warn = async (msg: string, opts?: EmbedOpts) => {
    onAbort()
    replyWarn(i, msg, opts)
    return null
  }
  return abort
}
export type AbortHelper = ReturnType<typeof createAbortHelper>

export function mockReplyHelper(i: ButtonInteraction<"cached">) {
  return mockHelper(i, () => i.deferUpdate()) as unknown as ReplyHelper
}
export function mockAbortHelper(i: ButtonInteraction<"cached">, onAbort: () => void) {
  return mockHelper(i, () => {
    onAbort()
    i.deferUpdate()
    return null
  }) as unknown as AbortHelper
}

const mockHelper = (i: ButtonInteraction<"cached">, fn: () => Awaitable<any>) => {
  const mockFn: any = fn
  mockFn.error = fn
  mockFn.warn = fn
  return fn
}
