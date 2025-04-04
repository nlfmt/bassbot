import type { ApplicationCommandOption, Awaitable } from "discord.js"
import type { CommandContext } from "./command"
import type { AbortHelper } from "./reply"

export type MiddlewareFn<AllowButtons extends boolean, Options extends ApplicationCommandOption[], Data extends Record<string, any>, NewData extends Record<string, any>> = (
  ctx: CommandContext<AllowButtons, Options, Data>,
  abort: AbortHelper
) => Awaitable<NewData | null>

export function createMiddleware<
  AllowButtons extends boolean,
  Options extends ApplicationCommandOption[],
  Data extends Record<string, any>,
  NewData extends Record<string, any>,
>(fn: MiddlewareFn<AllowButtons, Options, Data, NewData>) {
  return fn
}
