type Dimension = TemporalDimension | SpatialDimension | TrackDimension | IdDimension;
type Pair = [string, Dimension];

type ValidDimension = TemporalDimension | SpatialDimension | TrackDimension[] | IdDimension;

/**
 * MediaFragment
 *
 * ```javascript
 * import MediaFragment from '@kitaitimakoto/media-fragment';
 * 
 * let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
 * console.log(mf.toString()); // t=npt:10,20&xywh=pixel:160,120,320,240
 * ```
 */
class MediaFragment {
  #dimensions: Record<string, ValidDimension> = {};

  /**
   * * Components other than key-name format will be ignored.
   * * Keys other than `t`, `xywh`, `track` and `id` will be ignored.
   *   See https://www.w3.org/TR/media-frags/#processing-name-value-lists
   */
  constructor(init?: string) {
    if (typeof init === 'string') {
      this.#parseString(init);
    }
  }

  has(name: string): boolean {
    return name in this.#dimensions;
  }

  /**
   * @return Value of the last name-value pairs whose name is `name`.
   *
   * Why the last while `URLSearchParams.get()` returns the first?
   * See the [spec](https://www.w3.org/2008/WebVideo/Fragments/WD-media-fragments-spec/#error-uri-general).
   */
  get(name: string): ValidDimension | null {
    return this.#dimensions[name] ?? null;
  }

  entries(): Array<[string, ValidDimension]> {
    return Object.entries(this.#dimensions);
  }

  set(name: string, value: ValidDimension | string | string[]): void {
    if (name === 'track') {
      if (! isIterable(value)) {
        throw new TypeError('track must be iterable.');
      }
      this.#setTrack(value as TrackDimension[] | string[]);
      return;
    }

    const constructor = DIMENSIONS[name];
    if (! constructor) {
      throw new Error('${name} is not in supported dimensions ${Object.keys(DIMENSIONS).join(", ")}');
    }
    if (typeof value === 'string') {
      value = new constructor(value) as Exclude<ValidDimension, TrackDimension[] | string[]>;
    }
    this.#dimensions[name] = value as Exclude<ValidDimension, TrackDimension[] | string[]>;
  }

  #setTrack(value: TrackDimension[] | string[]): void {
    const tracks: TrackDimension[] = [];
    for (let track of value) {
      if (typeof track === 'string') {
        track = new TrackDimension(track);
      } else if (! (track instanceof TrackDimension)) {
        throw new Error(`Track value is invalid: ${value}`);
      }
      tracks.push(track);
    }
    this.#dimensions.track = tracks;
  }

  appendTrack(value: TrackDimension | string): void {
    if (typeof value === 'string') {
      value = new TrackDimension(value);
    }
    if (this.#dimensions.track){
      (this.#dimensions.track as TrackDimension[]).push(value);
    } else {
      this.#dimensions.track = [value];
    }
  }

  toString(): string {
    let str = '';
    let first = true;
    for (let name in this.#dimensions) {
      let value = this.#dimensions[name];
      if (! first) str += '&';
      if (first) first = false;
      if (name === 'track') {
        let firstTrack = true;
        for (let track of value as TrackDimension[]) {
          if (! firstTrack) str += '&';
          if (firstTrack) firstTrack = false;
          str += 'track=' + encodeURI(track.toString());
        }
      } else {
        str += encodeURI(name) + '=' + encodeURI(value.toString());
      }
    }
    return str;
  }

  get temporalDimension(): TemporalDimension | null {
    return this.get('t') as TemporalDimension | null
  }

  get spatialDimension(): SpatialDimension | null {
    return this.get('xywh') as SpatialDimension | null;
  }

  #parseString(string: string): void {
    if (string.startsWith('#')) {
      string = string.slice(1);
    }
    const pairStrings = string.split('&');
    for (let pairString of pairStrings) {
      const pos = pairString.indexOf('=');
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
      if (dimension instanceof TrackDimension) {
        const track = this.#dimensions.track as TrackDimension[];
        if (track) {
          track.push(dimension);
        } else {
          this.#dimensions.track = [dimension];
        }
      } else {
        this.#dimensions[name] = dimension;
      }
    }
  }
}

type TemporalDimensionFormat = 'npt'; // , smtpe or so. Currently npt is supported.

/**
 * Usage
 *
 * ```javascript
 * import MediaFragment from '@kitaitimakoto/media-fragument';
 * 
 * let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
 * console.log(td.s); // 10 (start time in seconds)
 * console.log(td.e); // 20 (end time in seconds)
 * ```
 * Usage with constructor:
 *
 * ```javascript
 * import {TemporalDimension} from '@kitaitimakoto/media-fragument';
 * 
 * let td = new TemporalDimension('10,20');
 * console.log(td.s); // 10
 * console.log(td.e); // 20
 * ```
 *
 * Various values
 *
 * ```javascript
 * let td = new TemporalDimension('10');
 * console.log(td.s); // 10
 * console.log(td.e); // Infinity (default end time which means end of media)
 * 
 * let td2 = new TemporalDimension('10,');
 * td2 === td1
 * 
 * let td3 = new TemporalDimension(',20');
 * console.log(td3.s); // 0 (default start time)
 * console.log(td3.e); // 20
 * 
 * let td4 = new TemporalDimension('0:02:00,121.5'); // from 2 minutes to 121.5 seconds
 * console.log(td4.s); // 120 (in seconds)
 * console.log(td4.e); // 121.5
 * ```
 */
class TemporalDimension {
  #format: TemporalDimensionFormat = 'npt';
  #s: number = 0;
  #e: number = Infinity;

  constructor(init?: string) {
    if (typeof init === 'string') {
      this.#parseString(init);
    }
  }

  /**
   * Format. Always "npt".
   */
  get format(): TemporalDimensionFormat {
    return this.#format;
  }

  set format(value: TemporalDimensionFormat) {
    // Noop because format is always 'npt';
  }

  /**
   * Start time
   */
  get s(): number {
    return this.#s;
  }

  set s(value: string | number) {
    if (typeof value === 'string') {
      value = this.#parseTimeString(value);
    }
    if ((! Number.isFinite(value) || Number.isNaN(value))) {
      throw new TypeError('Start time is not a finite floating-point value: ${value}');
      }
    this.#s = value;
  }

  /**
   * End time
   */
  get e(): number {
    return this.#e;
  }

  set e(value: string | number) {
    if (value === undefined) {
      this.#e = Infinity;
      return;
    }
    if (typeof value === 'string') {
      value = this.#parseTimeString(value);
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

  #parseString(string: string): void {
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

  #parseTimeString(string: string): number {
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

/**
 * Usage
 *
 * ```
 * import MediaFragment from '@kitaitimakoto/media-fragument';
 * 
 * let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
 * let sd = mf.get('xywh');
 * console.log(sd.x); // 160 px
 * console.log(sd.y); // 120 px
 * console.log(sd.w); // 320 px
 * console.log(sd.h); // 240 px
 * ```
 *
 * Usage with `new` operator:
 *
 * ```javascript
 * import {SpatialDimension} from '@kitaitimakoto/media-fragument';
 * 
 * let sd2 = new SpatialDimension('percent:25.3,25.5,50.456,50');
 * let width = 1000; // pixels
 * let height = 1000; // pixels
 * let result = sd2.clip({width, height});
 * console.log(result); // { x: 253, y: 255, w: 505, h: 500 }
 * ```
 */
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
      this.#parseString(value);
    }
  }

  /**
   * Unit. "pixel" or "percent".
   */
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

  /**
   * x coordinate
   */
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

  /**
   * y coordinate
   */
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

  /**
   * width
   */
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

  /**
   * height
   */
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
      const x = Math.min(this.#x, width);
      const y = Math.min(this.#y, height);
      const w = (x + this.#w > width) ? width - x : this.#w;
      const h = (y + this.#h > height) ? height - y : this.#h;
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

  #parseString(string: string): void {
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
      this.#parseString(value);
    }
  }

  toString(): string {
    return this.#value;
  }

  #parseString(string: string): void {
    this.#value = string;
  }
}

class IdDimension {
  #value: string;

  constructor(value?: string) {
    if (typeof value === 'string') {
      this.#parseString(value);
    }
  }

  toString(): string {
    return this.#value;
  }

  #parseString(string: string): void {
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

function isIterable(value: any): value is TrackDimension[] | string[] {
  return (value != null && value[Symbol.iterator] === 'function');
}

export default MediaFragment;
export {SpatialDimension, TemporalDimension};
