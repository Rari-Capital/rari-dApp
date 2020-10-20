/* eslint-disable */
export default class Cache {
  _raw = {};

  constructor(timeouts) {
    for (const key of Object.keys(timeouts))
      this._raw[key] = { value: null, lastUpdated: 0, timeout: timeouts[key] };
  }

  async getOrUpdate(key, asyncMethod) {
    var now = new Date().getTime() / 1000;

    if (
      this._raw[key].value == null ||
      now > this._raw[key].lastUpdated + this._raw[key].timeout
    ) {
      this._raw[key].value = await asyncMethod();
      this._raw[key].lastUpdated = now;
    }

    return this._raw[key].value;
  }

  update(key, value) {
    var now = new Date().getTime() / 1000;
    this._raw[key].value = value;
    this._raw[key].lastUpdated = now;
    return this._raw[key].value;
  }

  clear(key) {
    this._raw[key].value = null;
    this._raw[key].lastUpdated = 0;
  }
}
