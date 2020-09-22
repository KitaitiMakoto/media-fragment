import assert from 'assert';
import {MediaFragment, SpatialDimension} from '../index.js';

describe('constructor', () => {
  let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
  assert.strictEqual(mf.has('t'), true);
  assert.strictEqual(mf.get('t'), 'npt:10,20');
  assert.strictEqual(mf.has('xywh'), true);
  assert.deepStrictEqual(mf.get('xywh'), new SpatialDimension('pixel:160,120,320,240'));
  assert.strictEqual(mf.has('nothing'), false);
  assert.strictEqual(mf.get('nothing'), null);
  assert.strictEqual(decodeURIComponent(mf.toString()), 't=npt:10,20&xywh=pixel:160,120,320,240');

  assert.strictEqual(decodeURIComponent(new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240&t=10,20')).toString(), 't=npt:10,20&xywh=pixel:160,120,320,240&t=10,20');

  assert.strictEqual(decodeURIComponent(new MediaFragment('id=%xy&t=1')).toString(), 't=1');
});

describe('append', () => {
  let mf = new MediaFragment();
  mf.append('t', '10,20');
  assert.strictEqual(mf.get('t'), '10,20');
  mf.append('t', 'npt:10');
  assert.strictEqual(mf.get('t'), 'npt:10');
  assert.deepStrictEqual(mf.getAll('t'), ['10,20', 'npt:10']);
  assert.strictEqual(decodeURIComponent(mf.toString()), 't=10,20&t=npt:10');
  assert.deepStrictEqual(mf.entries(), [['t', '10,20'], ['t', 'npt:10']]);
});

describe('spatial', () => {
  describe('default', () => {
    let mf = new SpatialDimension();
    assert.strictEqual(mf.unit, 'pixel');
    assert.strictEqual(mf.x, 0);
    assert.strictEqual(mf.y, 0);
    assert.strictEqual(mf.w, 0);
    assert.strictEqual(mf.h, 0);
  });

  describe('getter', () => {
    let mf = new SpatialDimension('160,120,320,240');
    assert.strictEqual(mf.unit, 'pixel');
    assert.strictEqual(mf.x, 160);
    assert.strictEqual(mf.y, 120);
    assert.strictEqual(mf.w, 320);
    assert.strictEqual(mf.h, 240);

    let mf2 = new SpatialDimension('percent:25.3,25.5,50.456,50');
    assert.strictEqual(mf2.unit, 'percent');
    assert.strictEqual(mf2.x, 25.3);
    assert.strictEqual(mf2.y, 25.5);
    assert.strictEqual(mf2.w, 50.456);
    assert.strictEqual(mf2.h, 50.0);
    assert.strictEqual(mf2.toString(), 'percent:25.3,25.5,50.456,50');
  });

  describe('setter', () => {
    let mf = new SpatialDimension();
    mf.x = 160;
    mf.y = 120;
    mf.w = 320;
    mf.h = 240;
    assert.strictEqual(mf.toString(), 'pixel:160,120,320,240');
  });

  describe('resolve pixel', () => {
    let mf = new SpatialDimension('160,120,320,240');

    let w1 = 500;
    let h1 = 400;
    assert.deepStrictEqual(mf.resolve(w1, h1), {
      x: 160,
      y: 120,
      w: 320,
      h: 240
    });

    let w2 = 300;
    let h2 = 300;
    assert.deepStrictEqual(mf.resolve(w2, h2), {
      x: 160,
      y: 120,
      w: 140,
      h: 180
    });

    let w3 = 100;
    let h3 = 100;
    assert.deepStrictEqual(mf.resolve(w3, h3), {
      x: 100,
      y: 100,
      w: 0,
      h: 0
    });
  });

  describe('resolve percent', () => {
    let mf = new SpatialDimension('percent:25.3,25.5,50.456,50');
    let width = 1260;
    let height = 1476;
    let res = mf.resolve(width, height);
    assert.deepStrictEqual(res, {
      x: Math.floor(width * 25.3 / 100),
      y: Math.floor(height * 25.5 / 100),
      w: Math.ceil(width * 50.456 / 100),
      h: Math.ceil(height * 50 / 100)
    });
  });
});
