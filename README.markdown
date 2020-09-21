Media Fragment
==============

Media Fragments URI implementation describe at https://www.w3.org/2008/WebVideo/Fragments/WD-media-fragments-spec/ .

Synopsis
--------

```javascript
import {MediaFragmentSpatial} from '@kitaitimakoto/media-fragment';

let mfs = new MediaFragmentSpatial('160,120,320,240');
console.log(mfs.x); // => 160 px
console.log(mfs.y); // => 120 px
console.log(mfs.w); // => 320 px
console.log(mfs.h); // => 240 px

let mfs2 = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
let width = 1260; // pixels
let height = 1476; // pixels
let result = mfs2.resolve(width, height);
cosnole.log(result.x); // 74 px
console.log(result.y); // 64 px
console.log(result.w); // 31 px
console.log(result.h); // 37 px
```

Environments
------------

Media Fragment provides `index.js` file as an ES module. You can use it in both browser module scripts and Node.js modules.

### Browser ###

```html
<script type=module>
  import {MediaFragmentSpatial} from './node_modules/@kitaitimakoto/media-fragment/index.js';

  let mfs = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
  let width = 1260; // pixels
  let height = 1476; // pixels
  let result = mfs.resolve(width, height);
  console.log(result);
  // => Object { x: 318, y: 376, w: 636, h: 738 }
</script>
```

### Node.js module ###

```javascript
// index.mjs
import {MediaFragmentSpatial} from '@kitaitimakoto/media-fragment';

let mfs = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
let width = 1260; // pixels
let height = 1476; // pixels
let result = mfs.resolve(width, height);
console.log(result);
```

    % node index.mjs
    { x: 318, y: 376, w: 636, h: 738 }

### TypeScript ###

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

```typescript
// index.ts
import {MediaFragmentSpatial} from '@kitaitimakoto/media-fragment';

let mfs = new MediaFragmentSpatial('percent:25.3,25.5,50.456,50');
let width = 1260; // pixels
let height = 1476; // pixels
let result = mfs.resolve(width, height);
console.log(result);
```

    % tsc && mv index.js index.mjs && node index.mjs
    { x: 318, y: 376, w: 636, h: 738 }
