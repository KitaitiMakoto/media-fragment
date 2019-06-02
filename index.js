class MediaFragment {
  constructor(init) {
    this._pairs = [];
    if (typeof init === 'string') {
      this._pairs = this._parseString(init);
    }
  }

  has(name) {
    for (let [n, _] of this._pairs) {
      if (n === name) return true;
    }
    return false;
  }

  get(name) {
    const l = this._pairs.length;
    for (let i = l - 1; i >= 0; i--) {
      let [n, v] = this._pairs[i];
      if (n === name) return v;
    }
    return null;
  }

  getAll(name) {
    let values = [];
    for (let [n, v] of this._pairs) {
      if (n === name) values.push(v);
    }
    return values;
  }

  entries() {
    return this._pairs;
  }

  append(name, value) {
    this._pairs.push([name, value]);
  }

  toString() {
    let str = '';
    let first = true;
    for (let [name, value] of this._pairs) {
      if (! first) str += '&';
      if (first) first = false;
      str += encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }
    return str;
  }

  _parseString(string) {
    let pairs = [];
    let pairStrings = string.split('&');
    for (let pairString of pairStrings) {
      let pos = pairString.indexOf('=');
      if (pos === -1) continue;
      let name = pairString.slice(0, pos);
      try {
        name = decodeURIComponent(name);
      } catch(URIError) {
        continue;
      }
      let value = pairString.slice(pos + 1);
      try {
        value = decodeURIComponent(value);
      } catch(URIError) {
        continue;
      }
      pairs.push([name, value]);
    }
    return pairs;
  }
}

exports.MediaFragment = MediaFragment;
