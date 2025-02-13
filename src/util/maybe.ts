export type Maybe<Value, Error = undefined> = 
  | { success: true; value: Value, error?: undefined }
  | { success: false; value?: undefined, error: Error }
  
export const Maybe = {
  Yes<V, E = null>(value: V): Maybe<V, E> {
    return { success: true, value }
  },
  No<V, E>(error: E): Maybe<V, E> {
    return { success: false, error }
  }
}
