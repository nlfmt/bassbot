export type Flatten<T> = {
  [K in keyof T]: T[K]
}

export type Maybe<Value, Error = null> = Error extends null
  ? { success: true; value: Value } | { success: false }
  : { success: true; value: Value } | { success: false; error: Error }
