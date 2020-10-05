type Dimension = TemporalDimension | SpatialDimension | TrackDimension | IdDimension;
type Pair = [string, Dimension];

class MediaFragment {
  #pairs: Array<Pair> = [];

  /**
   * * Components other than key-name format will be ignored.
   * * Keys other than `t`, `xywh`, `track` and `id` will be ignored.
   *   See https://www.w3.org/TR/media-frags/#processing-name-value-lists
   */
  constructor(init?: string) {
    if (typeof init === 'string') {
      this._parseString(init);
    }
  }

  has(name: string): boolean {
    for (let [n, _] of this.#pairs) {
      if (n === name) return true;
    }
    return false;
  }

  /**
   * @return Value of the last name-value pairs whose name is `name`.
   *
   * Why the last while `URLSearchParams.get()` returns the first?
   * See the [spec](https://www.w3.org/2008/WebVideo/Fragments/WD-media-fragments-spec/#error-uri-general).
   */
  get(name: string): Dimension | null {
    const l = this.#pairs.length;
    for (let i = l - 1; i >= 0; i--) {
      let [n, v] = this.#pairs[i];
      if (n === name) return v;
    }
    return null;
  }

  getAll(name: string): Array<Dimension> {
    let values = [];
    for (let [n, v] of this.#pairs) {
      if (n === name) values.push(v);
    }
    return values;
  }

  entries(): Array<Pair> {
    return this.#pairs;
  }

  append(name: string, value: Dimension): void {
    this.#pairs.push([name, value]);
  }

  toString(): string {
    let str = '';
    let first = true;
    for (let [name, value] of this.#pairs) {
      if (! first) str += '&';
      if (first) first = false;
      str += encodeURI(name) + '=' + encodeURI(value.toString());
    }
    return str;
  }

  get temporalDimension(): TemporalDimension | null {
    return this.get('t') as TemporalDimension | null
  }

  get spatialDimension(): SpatialDimension | null {
    return this.get('xywh') as SpatialDimension | null;
  }

  _parseString(string: string): void {
    if (string.startsWith('#')) {
      string = string.slice(1);
    }
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
      const constructor = DIMENSIONS[name];
      if (! constructor) {
        console.warn(`${name} is not a name of Media Fragment URI. See https://www.w3.org/TR/media-frags/#processing-name-value-lists`);
        return;
      }
      let value = pairString.slice(pos + 1);
      try {
        value = decodeURIComponent(value);
      } catch(URIError) {
        continue;
      }
      const dimension = new constructor(value);
      this.#pairs.push([name, dimension]);
    }
  }
}

class TemporalDimension {
  #format: string = 'npt';
  #s: number = 0;
  #e: number = Infinity;

  constructor(init?: string) {
    if (typeof init === 'string') {
      this._parseString(init);
    }
  }

  get format() {
    return this.#format;
  }

  set format(value: string) {
    // Noop because format is always 'npt';
  }

  get s() {
    return this.#s;
  }

  set s(value: string | number) {
    if (typeof value === 'string') {
      value = this._parseTimeString(value);
    }
    if ((! Number.isFinite(value) || Number.isNaN(value))) {
      throw new TypeError('Start time is not a finite floating-point value: ${value}');
      }
    this.#s = value;
  }

  get e() {
    return this.#e;
  }

  set e(value: string | number) {
    if (value === undefined) {
      this.#e = Infinity;
      return;
    }
    if (typeof value === 'string') {
      value = this._parseTimeString(value);
    }
    if (Number.isNaN(value)) {
      throw new TypeError('End time is not a finite floating-point value: ${value}');
    }
    this.#e = value;
  }

  toString(): string {
    const e = this.#e === Infinity ? '' : this.#e;
    return `${this.#format}:${this.#s},${e}`;
  }

  _parseString(string: string): void {
    const prefix = 'npt:'
    if (string.startsWith(prefix)) {
      this.#format = 'npt';
      string = string.slice(prefix.length);
    }
    const [start, end] = string.split(',');
    if (start !== undefined) {
      this.s = start;
    }
    if (! (end === undefined || end === '')) {
      this.e = end;
    }
  }

  _parseTimeString(string: string): number {
    const comps = (string + '').split(':');
    if (comps.length === 0) {
      throw new TypeError('${string} is not in valid time format');
    }
    let time = 0;
    for (let i = 0, l = comps.length; i < l; i++) {
      time += Number(comps[l - i - 1]) * Math.pow(60, i);
    }
    return time;
  }
}

interface SpatialMedia {
  width: number,
  height: number
}

interface SpatialMediaClipping {
  x: number,
  y: number,
  w: number,
  h: number,
}

type SpatialUnit = 'pixel' | 'percent';

class SpatialDimension {
  #unit: SpatialUnit = 'pixel';
  #x: number = 0;
  #y: number = 0;
  #w: number = 0;
  #h: number = 0;

  /**
   * @throws Will throw an error if the argument'format is not valid.
   */
  constructor(value?: string) {
    if (typeof value === 'string') {
      this._parseString(value);
    }
  }

  get unit(): SpatialUnit {
    return this.#unit;
  }

  /**
   * @throws Will throw an error if the argument is neither 'pixel' nor 'percent'.
   */
  set unit(unit: SpatialUnit) {
    if (unit !== 'pixel' && unit !== 'percent') {
      throw new Error('unit must be "pixel" or "percent"');
    }
    this.#unit = unit;
  }

  get x(): number {
    return this.#x;
  }

  /**
   * @throws Will throw an error if the argument is not an integer.
   */
  set x(x: number) {
    if (! Number.isInteger(x)) {
      throw new Error('x must be an Integer');
    }
    this.#x = x;
  }

  get y(): number {
    return this.#y;
  }

  /**
   * @throws Will throw an error if the argument is not an integer.
   */
  set y(y: number) {
    if (! Number.isInteger(y)) {
      throw new Error('y must be an Integer');
    }
    this.#y = y;
  }

  get w(): number {
    return this.#w;
  }

  /**
   * @throws Will throw an error if the argument is not an integer.
   */
  set w(w: number) {
    if (! Number.isInteger(w)) {
      throw new Error('w must be an Integer');
    }
    this.#w = w;
  }

  get h(): number {
    return this.#h;
  }

  /**
   * @throws Will throw an error if the argument is not an integer.
   */
  set h(h: number) {
    if (! Number.isInteger(h)) {
      throw new Error('h must be an Integer');
    }
    this.#h = h;
  }

  clip({width, height}: SpatialMedia): SpatialMediaClipping {
    if (this.#unit === 'pixel') {
      let x = Math.min(this.#x, width);
      let y = Math.min(this.#y, height);
      let w = (x + this.#w > width) ? width - x : this.#w;
      let h = (y + this.#h > height) ? height - y : this.#h;
      return {x, y, w, h}
    } else {
      return {
        x: Math.floor(width * Math.min(this.#x, 100) / 100),
        y: Math.floor(height * Math.min(this.#y, 100) / 100),
        w: Math.ceil(width * Math.min(this.#w, 100) / 100),
        h: Math.ceil(height * Math.min(this.#h, 100) / 100)
      };
    }
  }

  toString(): string {
    return this.#unit + ':' + [this.#x, this.#y, this.#w, this.#h].join(',');
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
      this.#unit = 'percent';
      parser = parseFloat;
    } else {
      [_, _u, x, y, w, h] = m;
      this.#unit = 'pixel';
      parser = parseInt;
    }
    this.#x = parser(x);
    this.#y = parser(y);
    this.#w = parser(w);
    this.#h = parser(h);
  }
}

class TrackDimension {
  #value: string;

  constructor(value?: string) {
    if (typeof value === 'string') {
      this._parseString(value);
    }
  }

  toString(): string {
    return this.#value;
  }

  _parseString(string: string): void {
    this.#value = string;
  }
}

class IdDimension {
  #value: string;

  constructor(value?: string) {
    if (typeof value === 'string') {
      this._parseString(value);
    }
  }

  toString(): string {
    return this.#value;
  }

  _parseString(string: string): void {
    this.#value = string;
  }
}

interface DimensionConstructor {
  new(init?: string): Dimension
}

const DIMENSIONS: Record<string, DimensionConstructor> = {
  t: TemporalDimension,
  xywh: SpatialDimension,
  track: TrackDimension,
  id: IdDimension
};

export default MediaFragment;
export {SpatialDimension, TemporalDimension};
