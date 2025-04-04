import type { ApplicationCommandOption, Awaitable } from "discord.js"
import type { CommandContext } from "./command"
import { randomBytes } from "crypto"

export type ValidatorFn<
  AllowButtons extends boolean = false,
  Options extends ApplicationCommandOption[] = [],
  Data extends Record<string, unknown> = Record<string, never>,
> = (ctx: CommandContext<AllowButtons, Options, Data>) => Awaitable<boolean>

type Predicate<AllowButtons extends boolean = false, Args extends any[] = []> = Args extends [...infer _]
  ? (ctx: CommandContext<AllowButtons, any, any>, ...args: Args) => Awaitable<boolean>
  : (ctx: CommandContext<AllowButtons, any, any>) => Awaitable<boolean>

export interface Validator<AllowButtons extends boolean> {
  readonly _id: string
  validate: (ctx: CommandContext<AllowButtons, [], Record<string, never>>) => Awaitable<boolean>
  deps?: Validator<any>[]
}
type AnyValidator = Validator<any>

function stableHashArray(arr: any[]): string {
  const json = JSON.stringify(arr, (key, value) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    typeof value === "function" || typeof value === "bigint" ? value.toString() : value,
  )

  let hash = 2166136261 >>> 0 // FNV-1a hash
  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash.toString(16)
}

function _createValidator<AllowButtons extends boolean = boolean, Args extends any[] = []>(
  predicate: Predicate<AllowButtons, Args>,
  deps?: Validator<any>[],
) {
  const id = randomBytes(8).toString("hex")

  return (...args: Args) =>
    ({
      validate: (ctx: CommandContext<AllowButtons, [], Record<string, never>>) => predicate(ctx, ...args),
      _id: id + "-" + stableHashArray(args),
      deps,
    }) as Validator<AllowButtons>
}

export function createValidator<Options extends any[] = [], AllowButtons extends boolean = boolean>(
  validator: Predicate<AllowButtons, Options> | { deps: AnyValidator[]; validator: Predicate<AllowButtons, Options> },
) {
  if (typeof validator === "function") {
    return _createValidator(validator)
  }
  return _createValidator(validator.validator, validator.deps)
}

export async function runValidators(validators: Validator<any>[], ctx: CommandContext<any, any, any>) {
  const validatorCache = new Map<string, boolean>()

  async function runValidator(validator: Validator<any>): Promise<boolean> {
    const cached = validatorCache.get(validator._id)
    if (cached !== undefined) {
      return cached
    }

    for (const dep of validator.deps ?? []) {
      if (!(await runValidator(dep))) {
        validatorCache.set(validator._id, false)
        return false
      }
    }

    const valid = await validator.validate(ctx)
    validatorCache.set(validator._id, valid)
    return valid
  }

  for (const validator of validators ?? []) {
    const valid = await runValidator(validator)
    if (!valid) return false
  }
  return true
}