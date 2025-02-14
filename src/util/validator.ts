import type { ApplicationCommandOption, Awaitable } from "discord.js"
import type { CommandContext } from "./command"

export type ValidatorFn<
  AllowButtons extends boolean = false,
  Options extends ApplicationCommandOption[] = [],
  Data extends Record<string, unknown> = Record<string, never>
> = (ctx: CommandContext<AllowButtons, Options, Data>) => Awaitable<boolean>

type Predicate<AllowButtons extends boolean = false, Options extends any[] = []> = Options extends [...infer _]
  ? (ctx: CommandContext<AllowButtons, any, any>, ...options: Options) => Awaitable<boolean>
  : (ctx: CommandContext<AllowButtons, any, any>) => Awaitable<boolean>

type Validator<AllowButtons extends boolean = false, Options extends any[] = []> = Options extends [...infer _]
  ? (...options: Options) => (ctx: CommandContext<AllowButtons, any, any>) => Awaitable<boolean>
  : () => (ctx: CommandContext<AllowButtons, any, any>) => Awaitable<boolean>

function _createValidator<AllowButtons extends boolean = boolean, Options extends any[] = []>(
  predicate: Predicate<AllowButtons, Options>
) {
  return ((...options: any[]) => (ctx: CommandContext<any, any>) => predicate(ctx, ...options)) as Validator<
    AllowButtons,
    Options
  >
}

function _createCompositeValidator<Options extends any[] = [], AllowButtons extends boolean = false>(
  validators: ValidatorFn[],
  predicate: Predicate<AllowButtons, Options>
) {
  return ((...options: any[]) => {

    return async (ctx: CommandContext<any, any>) => {
      for (const validator of validators) {
        if (!(await validator(ctx))) return false
      }
      return await predicate(ctx, ...options)
    }

  }) as unknown as Validator<AllowButtons, Options>
}

export function createValidator<Options extends any[] = [], AllowButtons extends boolean = boolean>(
  validator: Predicate<AllowButtons, Options> | { deps: ValidatorFn[]; validator: Predicate<AllowButtons, Options> }
) {
  if (typeof validator === "function") {
    return _createValidator(validator)
  }
  return _createCompositeValidator(validator.deps, validator.validator)
}
