Media Fragment
==============

Media Fragments URI implementation describe at https://www.w3.org/2008/WebVideo/Fragments/WD-media-fragments-spec/ .

Synopsis
--------

```javascript
import {MediaMediaFragment, MediaFragmentSpatial} from '@kitaitimakoto/media-fragment';

let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
console.log(mf.toString()); // => t=npt%3A10%2C20&xywh=pixel%3A160%2C120%2C320%2C240

let mfs = mf.get('xywh');
console.log(mfs.x); // => 160 px
console.log(mfs.y); // => 120 px
console.log(mfs.w); // => 320 px
console.log(mfs.h); // => 240 px

let mfs2 = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
let width = 1260; // pixels
let height = 1476; // pixels
let result = mfs2.resolve(width, height);
cosnole.log(result);
// => Object { x: 318, y: 376, w: 636, h: 738 }
```

Environments
------------

Media Fragment provides `index.js` file as an ES module. You can use it in both browser module scripts and Node.js modules.

### Browser ###

```html
<script type=module>
  import {MediaMediaFragment, MediaFragmentSpatial} from '@kitaitimakoto/media-fragment';

  let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
  console.log(mf.toString()); // => t=npt%3A10%2C20&xywh=pixel%3A160%2C120%2C320%2C240

  let mfs = mf.get('xywh');
  console.log(mfs.x); // => 160 px
  console.log(mfs.y); // => 120 px
  console.log(mfs.w); // => 320 px
  console.log(mfs.h); // => 240 px

  let mfs2 = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
  let width = 1260; // pixels
  let height = 1476; // pixels
  let result = mfs2.resolve(width, height);
  cosnole.log(result);
  // => Object { x: 318, y: 376, w: 636, h: 738 }
</script>
```

### Node.js module ###

```javascript
// index.mjs
import {MediaFragment, MediaFragmentSpatial} from '@kitaitimakoto/media-fragment';

let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
console.log(mf.toString()); // => t=npt%3A10%2C20&xywh=pixel%3A160%2C120%2C320%2C240

let mfs = mf.get('xywh');
console.log(mfs.x); // => 160 px
console.log(mfs.y); // => 120 px
console.log(mfs.w); // => 320 px
console.log(mfs.h); // => 240 px

let mfs2 = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
let width = 1260; // pixels
let height = 1476; // pixels
let result = mfs2.resolve(width, height);
console.log(result);
```

    % node index.mjs
    t=npt%3A10%2C20&xywh=pixel%3A160%2C120%2C320%2C240
    160
    120
    320
    240
    { x: 318, y: 376, w: 636, h: 738 }

### TypeScript ###

```typescript
// index.ts
import {MediaFragment, MediaFragmentSpatial} from '@kitaitimakoto/media-fragment';

let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
console.log(mf.toString()); // => t=npt%3A10%2C20&xywh=pixel%3A160%2C120%2C320%2C240

let mfs = mf.get('xywh');
// Need if clause to show mfs is a MediaFragmentSpatial to compiler
if (mfs instanceof MediaFragmentSpatial) {
  console.log(mfs.x); // => 160 px
  console.log(mfs.y); // => 120 px
  console.log(mfs.w); // => 320 px
  console.log(mfs.h); // => 240 px
}

let mfs2 = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
let width = 1260; // pixels
let height = 1476; // pixels
let result = mfs2.resolve(width, height);
console.log(result);
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ES2020",
    "target": "ES2020",
    "moduleResolution": "node"
  },
  "files": [
    "index.ts"
  ]
}
```

    % tsc && mv index.js index.mjs && node index.mjs
    { x: 318, y: 376, w: 636, h: 738 }
