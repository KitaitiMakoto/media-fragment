class MediaFragment {
  constructor(init) {
    this._pairs = [];
    if (typeof init === 'string') {
      this._pairs = this._parseString(init);
    }
  }

  has(name) {
    for (let pair of this._pairs) {
      if (pair[0] === name) return true;
    }
    return false;
  }

  get(name) {
    for (let pair of this._pairs) {
      if (pair[0] === name) return pair[1]
    }
    return null;
  }

  getAll(name) {
    let values = [];
    for (let pair of this._pairs) {
      if (pair[0] === name) values.push(pair[1]); 
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
