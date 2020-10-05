Media Fragment
==============

Media Fragments URI implementation described at https://www.w3.org/2008/WebVideo/Fragments/WD-media-fragments-spec/ .

Synopsis
--------

```javascript
import MediaFragment, {TemporalDimension, SpatialDimension} from '@kitaitimakoto/media-fragment';

let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
console.log(mf.toString()); // t=npt:10,20&xywh=pixel:160,120,320,240

let td = mf.get('t'); // TemporalDimension
td === mf.temporalDimension;
console.log(td.s); // start time: 10 seconds
console.log(td.e); // end time: 20 seconds

let sd = mf.get('xywh'); // SpatialDimension
console.log(sd.x); // 160 px
console.log(sd.y); // 120 px
console.log(sd.w); // 320 px
console.log(sd.h); // 240 px

let sd2 = new SpatialDimension('percent:25.3,25.5,50.456,50');
let width = 1000; // pixels
let height = 1000; // pixels
let result = sd2.clip({width, height});
console.log(result); // { x: 253, y: 255, w: 505, h: 500 }
```

Environments
------------

Media Fragment provides `index.js` file as an ES module. You can use it in both browser module scripts and Node.js modules.

### Browser ###

```html
<script type=module>
  import MediaFragment, {SpatialDimension} from './node_modules/@kitaitimakoto/media-fragment/index.js';

  let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
  // work with `mf`
</script>
```

### Node.js module ###

`index.mjs`:

```javascript
import MediaFragment, {SpatialDimension} from '@kitaitimakoto/media-fragment';

let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');
// work with `mf`
```

Run script:

    % node index.mjs

### TypeScript ###

`index.ts`:

```typescript
import MediaFragment, {SpatialDimension} from '@kitaitimakoto/media-fragment';

let mf = new MediaFragment('t=npt:10,20&xywh=pixel:160,120,320,240');

let sd = mf.get('xywh');
// Need if clause to tell that mfs is a SpatialDimension to compiler
if (sd instanceof SpatialDimension) {
  console.log(sd.x); // 160 px
  console.log(sd.y); // 120 px
  console.log(sd.w); // 320 px
  console.log(sd.h); // 240 px
}

// Or
let sdAlt = mf.spatialDimension;
console.log(sdAlt.x); // 160 px
console.log(sdAlt.y); // 120 px
console.log(sdAlt.w); // 320 px
console.log(sdAlt.h); // 240 px

// work with `mf` and `sd` or `sdAlt`
```

`tsconfig.json`:

```json
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

Run the script:

    % tsc && mv index.js index.mjs && node index.mjs
    160
    120
    320
    240

API
----

Visit https://kitaitimakoto.gitlab.io/media-fragment/

Source Code
-----------

Visit https://gitlab.com/KitaitiMakoto/media-fragment
