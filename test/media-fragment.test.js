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
  });

  test('setter', () => {
    let mf = new MediaFragmentSpatial();
    mf.x = 160;
    mf.y = 120;
    mf.w = 320;
    mf.h = 240;
    expect(mf.toString()).toBe('pixel:160,120,320,240');
  });
});
