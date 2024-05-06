import type { BassBot } from "@/bot"
import {
  type ApplicationCommandOption,
  type Awaitable,
  ButtonInteraction,
  ChatInputCommandInteraction,
} from "discord.js"
import fs from "node:fs"
import path from "node:path"
import type { ResolveOptions } from "./option-resolver"
import logger from "../logger"
import type { ReplyHelper } from "../reply"
import type { ValidatorFn } from "../validator"
import type { MiddlewareFn } from "../middleware"

export type CommandContext<
  AllowButtons extends boolean = false,
  Options extends ApplicationCommandOption[] = [],
  Data extends Record<string, any> = Record<string, never>,
> = {
  i: AllowButtons extends true
    ? ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">
    : ChatInputCommandInteraction<"cached">
  bot: BassBot
  reply: ReplyHelper
  data: Data,
  options: ResolveOptions<Options>
}

export type Command<
  AllowButtons extends boolean = false,
  Options extends ApplicationCommandOption[] = [],
  Data extends Record<string, any> = Record<string, never>,
> = {
  name: string
  description: string
  allowButtons?: AllowButtons
  category: string
  options?: Options
  validators?: ValidatorFn<NoInfer<AllowButtons>, Options, Record<string, never>>[]
  middleware?: MiddlewareFn<AllowButtons, Data>,
  run: (ctx: CommandContext<NoInfer<AllowButtons>, Options, NoInfer<Data>>) => Awaitable<unknown>
} 

export type CommandDef<
  AllowButtons extends boolean = false,
  Options extends ApplicationCommandOption[] = [],
  Data extends Record<string, any> = Record<string, never>,
> = Omit<Command<AllowButtons, Options, Data>, "category" | "name">

export const createCommand = <
  Options extends ApplicationCommandOption[] = [],
  Data extends Record<string, any> = Record<string, never>, 
  AllowButtons extends boolean = false
>(cmd: CommandDef<AllowButtons, Options, Data>) => cmd


export async function loadCommands() {
  const dir = path.join(import.meta.dir, "..", "..", "commands")
  const commands: Map<string, Command<boolean, ApplicationCommandOption[], Record<string, never>>> = new Map()
  
  await Promise.allSettled(
    fs.readdirSync(dir).map(category =>
      fs.readdirSync(`${dir}/${category}`).map(async file => {
        const module = await import(`${dir}/${category}/${file}`)
        const cmd = module.default as CommandDef<any, any>
        const name = file.split(".")[0]!
        const valid = !!cmd.description

        if (!valid) return logger.warn(`${category}/${name} is invalid. Missing description.`)
        if (commands.has(name)) return logger.warn(`Command ${category}/${file} is already registered.`)

        commands.set(name, {
          name,
          category,
          ...cmd,
        })
      })
    ).flat()
  )

  return commands
}