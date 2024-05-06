import type { CommandContext } from "./command"
import type { AbortHelper } from "./reply"

export type MiddlewareFn<AllowButtons extends boolean, Data extends Record<string, any>> = (
  ctx: CommandContext<AllowButtons, any, any>,
  abort: AbortHelper
) => Promise<Data | null>

export function createMiddleware<
  AllowButtons extends boolean = false,
  Data extends Record<string, any> = Record<string, any>
>(fn: MiddlewareFn<AllowButtons, Data>) {
  return fn
}
