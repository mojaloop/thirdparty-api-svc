
/**
 * @class CompositeKeyMap
 * @description CompositeKeyMap is a special extension of Map, which will stringify the `key` value passed in
 *   This allows us to nicely and easily set composite keys
 */
export default class CompositeKeyMap<T, U> extends Map {
  get (key: T) {
    return super.get(JSON.stringify(key))
  }

  set (key: T, value: U) {
    return super.set(JSON.stringify(key), value)
  }
}
