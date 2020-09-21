type Pair = [string, string];

class MediaFragment {
  _pairs: Array<Pair>;

  constructor(init?: string) {
    this._pairs = [];
    if (typeof init === 'string') {
      this._pairs = this._parseString(init);
    }
  }

  has(name: string): boolean {
    for (let [n, _] of this._pairs) {
      if (n === name) return true;
    }
    return false;
  }

  get(name: string): string | null {
    const l = this._pairs.length;
    for (let i = l - 1; i >= 0; i--) {
      let [n, v] = this._pairs[i];
      if (n === name) return v;
    }
    return null;
  }

  getAll(name: string): Array<string> {
    let values = [];
    for (let [n, v] of this._pairs) {
      if (n === name) values.push(v);
    }
    return values;
  }

  entries(): Array<Pair> {
    return this._pairs;
  }

  append(name: string, value: string): void {
    this._pairs.push([name, value]);
  }

  toString(): string {
    let str = '';
    let first = true;
    for (let [name, value] of this._pairs) {
      if (! first) str += '&';
      if (first) first = false;
      str += encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }
    return str;
  }

  _parseString(string: string): Array<Pair> {
    let pairs: Array<Pair> = [];
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
  _unit: string;
  _x: number;
  _y: number;
  _w: number;
  _h: number;

  constructor(value?: string) {
    this._unit = 'pixel';
    this._x = this._y = this._w = this._h = 0;
    if (typeof value === 'string') {
      this._parseString(value);
    }
  }

  get unit(): string {
    return this._unit;
  }

  set unit(unit: string) {
    if (unit !== 'pixel' && unit !== 'percent') {
      throw new Error('unit must be "pixel" or "percent"');
    }
    this._unit = unit;
  }

  get x(): number {
    return this._x;
  }

  set x(x: number) {
    if (! Number.isInteger(x)) {
      throw new Error('x must be an Integer');
    }
    this._x = x;
  }

  get y(): number {
    return this._y;
  }

  set y(y: number) {
    if (! Number.isInteger(y)) {
      throw new Error('y must be an Integer');
    }
    this._y = y;
  }

  get w(): number {
    return this._w;
  }

  set w(w: number) {
    if (! Number.isInteger(w)) {
      throw new Error('w must be an Integer');
    }
    this._w = w;
  }

  get h(): number {
    return this._h;
  }

  set h(h: number) {
    if (! Number.isInteger(h)) {
      throw new Error('h must be an Integer');
    }
    this._h = h;
  }

  resolve(sourceWidth: number, sourceHeight: number): object {
    if (this._unit === 'pixel') {
      let x = Math.min(this._x, sourceWidth);
      let y = Math.min(this._y, sourceHeight);
      let w = (x + this._w > sourceWidth) ? sourceWidth - x : this._w;
      let h = (y + this._h > sourceHeight) ? sourceHeight - y : this._h;
      return {x, y, w, h}
    } else {
      return {
        x: Math.floor(sourceWidth * Math.min(this._x, 100) / 100),
        y: Math.floor(sourceHeight * Math.min(this._y, 100) / 100),
        w: Math.ceil(sourceWidth * Math.min(this._w, 100) / 100),
        h: Math.ceil(sourceHeight * Math.min(this._h, 100) / 100)
      };
    }
  }

  toString(): string {
    return this._unit + ':' + [this._x, this._y, this._w, this._h].join(',');
  }

  _parseString(string: string): void {
    let x, y, w, h;
    let _, _u, _xfrac, _yfrac, _wfrac, _hfrac;
    let parser;
    let m = string.match(/^(pixel:)?(\d+),(\d+),(\d+),(\d+)$/);
    if (m === null) {
      m = string.match(/^percent:(\d+(\.\d+)?),(\d+(\.\d+)?),(\d+(\.\d+)?),(\d+(\.\d+)?)$/);
      if (m === null) {
        throw new Error('invalid format');
      }
      [_, x, _xfrac, y, _yfrac, w, _wfrac, h, _hfrac] = m;
      this._unit = 'percent';
      parser = parseFloat;
    } else {
      [_, _u, x, y, w, h] = m;
      this._unit = 'pixel';
      parser = parseInt;
    }
    this._x = parser(x);
    this._y = parser(y);
    this._w = parser(w);
    this._h = parser(h);
  }
}

export {MediaFragment, MediaFragmentSpatial};
