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

class MediaFragmentSpatial {
  constructor(value) {
    this._unit = 'pixel';
    this._x = this._y = this._w = this._h = 0;
    if (typeof value === 'string') {
      this._parseString(value);
    }
  }

  get unit() {
    return this._unit;
  }

  set unit(unit) {
    if (unit !== 'pixel' && unit !== 'percent') {
      throw new Error('unit must be "pixel" or "percent"');
    }
    return this._unit = unit;
  }

  get x() {
    return this._x;
  }

  set x(x) {
    if (! Number.isInteger(x)) {
      throw new Error('x must be an Integer');
    }
    return this._x = x;
  }

  get y() {
    return this._y;
  }

  set y(y) {
    if (! Number.isInteger(y)) {
      throw new Error('y must be an Integer');
    }
    return this._y = y;
  }

  get w() {
    return this._w;
  }

  set w(w) {
    if (! Number.isInteger(w)) {
      throw new Error('w must be an Integer');
    }
    return this._w = w;
  }

  get h() {
    return this._h;
  }

  set h(h) {
    if (! Number.isInteger(h)) {
      throw new Error('h must be an Integer');
    }
    return this._h = h;
  }

  toString() {
    return this._unit + ':' + [this._x, this._y, this._w, this._h].join(',');
  }

  _parseString(string) {
    let [_, __, unit, x, y, w, h] = string.match(/^((pixel|percent):)?(\d+),(\d+),(\d+),(\d+)$/);
    if (x === null) {
      throw new Error('invalid format');
    }
    this._unit = unit || 'pixel';
    this._x = Number.parseInt(x);
    this._y = Number.parseInt(y);
    this._w = Number.parseInt(w);
    this._h = Number.parseInt(h);
  }
}

exports.MediaFragment = MediaFragment;
exports.MediaFragmentSpatial = MediaFragmentSpatial;
