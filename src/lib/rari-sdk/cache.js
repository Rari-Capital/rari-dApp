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
      var self = this;
      if (this._raw[key].updating)
        return await new Promise(async function (resolve) {
          if (typeof self._raw[key].onUpdate === "undefined")
            self._raw[key].onUpdate = [];
          self._raw[key].onUpdate.push(resolve);
        });
      this._raw[key].updating = true;
      this._raw[key].value = await asyncMethod();
      this._raw[key].lastUpdated = now;
      this._raw[key].updating = false;
      if (
        typeof this._raw[key].onUpdate !== "undefined" &&
        this._raw[key].onUpdate.length > 0
      ) {
        for (const onUpdate of this._raw[key].onUpdate)
          onUpdate(this._raw[key].value);
        this._raw[key].onUpdate = [];
      }
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
