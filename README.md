# Image generator

Generate many versions of an image. Useful in static site generation for
responsive design and SEO.

Given a jpeg or png master and an array of **image spec** strings, returns a
array of promises that each resolve to an **asset object**.

Each string in the **image spec** array defines ratio, width and format. For
example `8x5-800w.webp`. Here's the [image
spec](./test/fixtures/image-spec.json) used in the demo and tests.

The **asset object** is an object (like a webpack asset) on which:
- `name` is derived from the master image name, a hash of the master image's
  bytes, and the spec. For example
  `master-name-484ecd25f430a73da7a9104a87f6b56f-8x5-800w.jpg`.
- `source()` returns the new image bytes.
- `size()` returns the byte length of the new image.

See [demo.js](./test/demo.js) for example usage.

```bash
# once
npm install

# process the test image to example spec and output to ./dist 
npm run demo


# run the tests
npm test
```