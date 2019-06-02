const {MediaFragment, MediaFragmentSpatial} = require('../index');

test('constructor', () => {
  let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
  expect(mf.has('t')).toBeTruthy();
  expect(mf.get('t')).toBe('npt:10,20');
  expect(mf.has('xywh')).toBeTruthy();
  expect(mf.get('xywh')).toBe('pixel:160,120,320,240');
  expect(mf.has('nothing')).toBeFalsy();
  expect(mf.get('nothing')).toBeNull();
  expect(decodeURIComponent(mf.toString())).toBe('t=npt:10,20&xywh=pixel:160,120,320,240');

  expect(decodeURIComponent(new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240&t=10,20')).toString()).toBe('t=npt:10,20&xywh=pixel:160,120,320,240&t=10,20');

  expect(decodeURIComponent(new MediaFragment('id=%xy&t=1')).toString()).toBe('t=1');
});

test('append', () => {
  let mf = new MediaFragment();
  mf.append('t', '10,20');
  expect(mf.get('t')).toBe('10,20');
  mf.append('t', 'npt:10');
  expect(mf.get('t')).toBe('npt:10');
  expect(mf.getAll('t')).toEqual(['10,20', 'npt:10']);
  expect(decodeURIComponent(mf.toString())).toBe('t=10,20&t=npt:10');
  expect(mf.entries()).toEqual([['t', '10,20'], ['t', 'npt:10']]);
});

describe('spatial', () => {
  test('default', () => {
    let mf = new MediaFragmentSpatial();
    expect(mf.unit).toBe('pixel');
    expect(mf.x).toBe(0);
    expect(mf.y).toBe(0);
    expect(mf.w).toBe(0);
    expect(mf.h).toBe(0);
  });

  test('getter', () => {
    let mf = new MediaFragmentSpatial('160,120,320,240');
    expect(mf.unit).toBe('pixel');
    expect(mf.x).toBe(160);
    expect(mf.y).toBe(120);
    expect(mf.w).toBe(320);
    expect(mf.h).toBe(240);

    let mf2 = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
    expect(mf2.unit).toBe('percent');
    expect(mf2.x).toBe(25.3);
    expect(mf2.y).toBe(25.5);
    expect(mf2.w).toBe(50.456);
    expect(mf2.h).toBe(50.0);
    expect(mf2.toString()).toBe('percent:25.3,25.5,50.456,50');
  });

  test('setter', () => {
    let mf = new MediaFragmentSpatial();
    mf.x = 160;
    mf.y = 120;
    mf.w = 320;
    mf.h = 240;
    expect(mf.toString()).toBe('pixel:160,120,320,240');
  });

  test('resolve pixel', () => {
    let mf = new MediaFragmentSpatial('160,120,320,240');

    let w1 = 500;
    let h1 = 400;
    expect(mf.resolve(w1, h1)).toEqual({
      x: 160,
      y: 120,
      w: 320,
      h: 240
    });

    let w2 = 300;
    let h2 = 300;
    expect(mf.resolve(w2, h2)).toEqual({
      x: 160,
      y: 120,
      w: 140,
      h: 180
    });

    let w3 = 100;
    let h3 = 100;
    expect(mf.resolve(w3, h3)).toEqual({
      x: 100,
      y: 100,
      w: 0,
      h: 0
    });
  });

  test('resolve percent', () => {
    let mf = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
    let width = 1260;
    let height = 1476;
    let res = mf.resolve(width, height);
    expect(res).toEqual({
      x: Math.floor(width * 25.3 / 100),
      y: Math.floor(height * 25.5 / 100),
      w: Math.ceil(width * 50.456 / 100),
      h: Math.ceil(height * 50 / 100)
    });
  });
});
