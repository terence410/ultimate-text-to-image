# Ultimate Text To Image

Generate Unicode texts into image with auto line break for all international language, including Chinese, Japanese, Korean, Russian, etc.. You can find a lot of similar library, but hardly find any library deal with utf8 texts with auto wrapping. 

[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/ultimate-text-to-image.svg
[npm-url]: https://npmjs.org/package/ultimate-text-to-image

Thanks to [linebreak](https://www.npmjs.com/package/linebreak), we can detect the correct line break and wrapping with ease. 
The actual depended package is [linebreak-next](https://www.npmjs.com/package/linebreak-next), which is compatible with Browser and provided by the collaborator of the original package.

This library depends on [canvas](https://www.npmjs.com/package/canvas) for rendering. Please refer to their doc for further optimization. A canvas object can be modified during the rendering phase.  

![sample](https://i.imgur.com/ACesELy.png)

# Feature Highlights
- auto wrap for unicode texts (Chinese, Korean, Japanese, etc...)
- support adding image with various position & repeat features
- perfect alignment of texts by detecting the actual drawing pixels of glyphs
- library works for NodeJs & browser, react component is provided
- combining multiple text images into one single image
- auto reduce font size to fit the given image size
- high performance, generating a 100 words image only takes around 2ms. 
- works in both JS & typescript

# Quick Start

```typescript
import { UltimateTextToImage} from "ultimate-text-to-image";
// const {UltimateTextToImage} = require("ultimate-text-to-image");

new UltimateTextToImage(`abc xyz 0123456789 零一二三四五六七八九`, {width: 150, fontFamily: "Arial, Sans"})
    .render()
    .toFile("image1.png");
```

![sample](https://i.imgur.com/3H2lE9v.png)

# Advanced
```typescript
import path from "path";
import {getCanvasImage, HorizontalImage, registerFont, UltimateTextToImage, VerticalImage} from "ultimate-text-to-image";
// const path = require("path");
// const {getCanvasImage, HorizontalImage, registerFont, UltimateTextToImage, VerticalImage} = require("ultimate-text-to-image");

// render the image
const textToImage = new UltimateTextToImage("Ultimate Text To Image", {
    width: 400,
    maxWidth: 1000,
    maxHeight: 1000,
    fontFamily: "Arial",
    fontColor: "#00FF00",
    fontSize: 72,
    minFontSize: 10,
    lineHeight: 50,
    autoWrapLineHeightMultiplier: 1.2,
    margin: 20,
    marginBottom: 40,
    align: "center",
    valign: "middle",
    borderColor: 0xFF000099,
    borderSize: 2,
    backgroundColor: "0080FF33",
    underlineColor: "#00FFFF33",
    underlineSize: 2,
});
textToImage.render().toFile(path.join(__dirname, "image2.png"));

// properties
const width = textToImage.width; // final canvas size
const height = textToImage.height;  // final canvas size
const renderedTime = textToImage.renderedTime; // rendering time of canvas
const measuredParagraph = textToImage.measuredParagraph; // all the details of the texts in size
const canvas = textToImage.canvas; // the node-canvas
const hasRendered = textToImage.hasRendered; // a flag to indicate if render() has run

// render again (this will create a new canvas)
const options = textToImage.options.fontFamily = "Comic Sans MS";
const buffer = textToImage.render().toBuffer("image/jpeg");
```

![sample](https://i.imgur.com/YdBb6pD.png)

# Export

```typescript
const textToImage = new UltimateTextToImage("Hello World").render();
const dataUrlPng = textToImage.toDataUrl(); // image/png by default
const dataUrlJpeg = textToImage.toDataUrl("image/jpeg", {quality: 80});

const buffer = textToImage.toBuffer(); // png by default
const bufferPng = textToImage.toBuffer("image/png", {compressionLevel: 6});
const bufferJpeg = textToImage.toBuffer("image/jpeg", {quality: 80, progressive: true});

const file = textToImage.toFile(path.join(__dirname, "imageE1")); // png by default
const filePng = textToImage.toFile(path.join(__dirname, "imageE2.png")); // detect by file extension
const fileJpeg = textToImage.toFile(path.join(__dirname, "imageE3.jpeg"), "image/jpeg", {quality: 80});

const streamPng = textToImage.toStream(); // png by default
const streamJpeg = textToImage.toStream("image/jpeg"); // png by default

// save by stream
const out = fs.createWriteStream(path.join(__dirname, "imageE4.png"));
streamPng.pipe(out);
await new Promise((resolve, reject) => out.on("finish", resolve).on("error", reject));
```

# Adding Images
```typescript
const url = "https://i.imgur.com/EP7lGGu.jpg";
const buffer = new UltimateTextToImage("repeatX").render().toBuffer();
const base64 = new UltimateTextToImage("fitY").render().toBuffer().toString("base64");
const arrayBuffer = new Uint8Array(new UltimateTextToImage("repeat").render().toBuffer());

// images
const canvasImage1 = await getCanvasImage({url});
const canvasImage2 = await getCanvasImage({base64});
const canvasImage3 = await getCanvasImage({buffer});
const canvasImage4 = await getCanvasImage({arrayBuffer});

// use various way to draw the image
const textToImage = new UltimateTextToImage("Image Example", {
    width: 600,
    height: 600,
    alignToCenterIfLinesLE: 1,
    fontSize: 72,
    backgroundColor: "#FFFFFF99",
    images: [
        {canvasImage: canvasImage1, layer: -1, repeat: "fit"},
        {canvasImage: canvasImage2, layer: 0, repeat: "fitY", x: 10, y: 10, width: 100, height: 100},
        {canvasImage: canvasImage3, layer: 1, repeat: "repeatX", sx: -400, sy: 100, width: 300, height: 300},
        {canvasImage: canvasImage4, layer: 1, repeat: "repeat", sx: -200, sy: -300, tx: -50, ty: -50},
    ],
})
.render()
.toFile(path.join(__dirname, "image3.png"));
```
![sample](https://i.imgur.com/DssHJWd.png)

# Pre Render / Post Render

```typescript
// ICanvas is alias of Canvas in "canvas" package,
import {UltimateTextToImage, ICanvas} from "ultimate-text-to-image";

const textToImage = new UltimateTextToImage("Rendering", {}, {
    preRender: (canvas: ICanvas) => {
        // before drawing anything on the canvas (when render() is called)
    },
    posRender: (canvas: ICanvas) => {
        // after drawing all the texts and images
    },
}).render();
```

# Register Font

```typescript
import path from "path";
import {UltimateTextToImage, registerFont} from "ultimate-text-to-image";

// register font
registerFont("./tests/fonts/NotoSansTC-Regular.otf");

// render the image
new UltimateTextToImage("Noto Sans TC:\n床前明月光，\n疑是地上霜，\n舉頭望明月，\n低頭思故鄉。", {fontFamily: "Noto Sans TC", fontSize: 30, fontStyle: "italic"})
    .render()
    .toFile(path.join(__dirname, "image4.png"));
```
![sample](https://i.imgur.com/HAKP8cS.png)

# Mixed Image

```typescript
import {UltimateTextToImage, HorizontalImage, VerticalImage} from "ultimate-text-to-image";

const textToImage1 = new UltimateTextToImage("Image1",
    {backgroundColor: "#0080FF33", fontSize: 60});
const textToImage2 = new UltimateTextToImage("Image2 ".repeat(10).trim(),
    {maxWidth: 200, backgroundColor: "#00FF0033", fontSize: 40});

const horizontalImage = new HorizontalImage([
    textToImage1,
    textToImage2,
    new HorizontalImage([
        new UltimateTextToImage("Horizontal 1"),
        new UltimateTextToImage("Horizontal 2", {fontSize: 50}),
    ]),
    new VerticalImage([
        new UltimateTextToImage("Vertical 1"),
        new UltimateTextToImage("Vertical 2", {fontColor: "#FF0000"}),
    ]),
], {valign: "bottom", backgroundColor: "#AAAAAA", margin: 100});

horizontalImage.render().toFile(path.join(__dirname, "imageMixed1.jpg"));
```
![sample](https://i.imgur.com/2EKpJ9K.jpg)

# React

```typescript jsx

import {UltimateTextToImageComponent} from "ultimate-text-to-image/build/UltimateTextToImageComponent";
// const {UltimateTextToImageComponent} = require("ultimate-text-to-image/build/UltimateTextToImageComponent");

function Component() {
    return <UltimateTextToImageComponent text="Hello World" fontSize={30}/>
}

```

# Options for UltimateTextToImage

| Name | Type | Default | Usage |
| --- | --- | --- | --- |
width|number| |width of the canvas
height|number| |height of the canvas
maxHeight|number|undefined|dynamically expand the canvas height to fill more texts
noAutoWrap|boolean|false |disable auto wrap
fontFamily|string|Arial|font family
bold|boolean / string|false |bold, bolder, lighter, 100-900. set it true for bold
italic|boolean / string|false |italic, oblique, set it to true for italic
fontSize|number|24|font size
minFontSize|number|0 |choose a smaller font size to fill all the texts within the canvas
fontColor|number / string|#000000 |RRGGBBAA: 0xFF0000: 100% red, 0xFF000080: 50% red, "#999999": 100% gray, "#999919": 10% gray
strokeSize|number|0 |stroke size
strokeColor|number / string|#000000 |same as fontColor
lineHeight|number|0 |line height. default to fontSize
lineHeightMultiplier|number|0 |line height = final font size * this value
autoWrapLineHeight|number|0 |auto wrap line height
autoWrapLineHeightMultiplier|number|0 |auto wrap line height = final font size * this value
margin|number|0 |margin
marginLeft|number|undefined|margin left. use margin if undefined
marginTop|number|undefined|margin top. use margin if undefined
marginRight|number|undefined|margin right. use margin if undefined
marginBottom|number|undefined|margin bottom. use margin if undefined
useGlyphPadding|boolean|true|use the actual rending pixels for alignments
chopOverflow|boolean|false |chop rendering overlapping the margin
align|string|left|horizontal alignment: left, center, right
valign|string|top|vertical alignment: top, middle, bottom
alignToCenterIfHeightLessThan|number|0 |align to center if final texts rendered height <= this value
alignToCenterIfLinesLessThan|number|0 |align to center if total lines <= this value
nestedAlign|string|left|used when it's put inside VerticalImage
nestedValign|string|top|used when it's put inside HorizontalImage
borderColor|number / string|#000000 |same as fontColor
borderSize|number|0 |border size
backgroundColor|number / string|""|same as fontColor
underlineSize|number|0 |underline size
underlineColor|number / string|#000000 |same as fontColor
images|array|[]|see below
image.canvasImage|CanvasImage| |get the CanvasImage object by calling getCanvasImage(). Please refer to the coding sample
image.layer|number|0|0: below background color and border. 1: below the texts, 2: above the texts
image.repeat|string|topLeft|fit, fitX, fitY, repeat, repeatX, repeatY, topLeft, topCenter, topRight, middleLeft, etc..
image.x|number|undefined|x = 0 if sx is not set
image.y|number|undefined|y = 0 if sy is not set
image.sx|number|undefined|if sx < 0, x = canvas width + sx, else x = sx
image.sy|number|undefined|if sy < 0, y = canvas height + sy, else y = sy
image.tx|number|undefined|if tx < 0, width = tx - x, else width = canvas width + tx - x
image.ty|number|undefined|if ty < 0, height = ty - y, else height = canvas height + ty - y
image.width|number / string|undefined|width = canvas width - x if width is not set. "width" = image width, "canvas" = canvas width
image.height|number / string|undefined|height = canvas height - x if height is not set. "height" = image height, "canvas" = canvas height
# Options for VerticalImage / Horizontal Image

VerticalImage and Horizontal only supports the following options
- backgroundColor 
- align
- valign
- nestedAlign
- nestedValign
- margin

# Notes on glyph padding

By default, useGlyphPadding is true. Meaning it will take the padding size into account.

Here are the examples with or without useGlyphPadding

```typescript
new UltimateTextToImage("Agjpqy!", {useGlyphPadding: false, underlineSize: 1, backgroundColor: "#00FFFF99"})
```
![sample](https://i.imgur.com/hdqJiJZ.png)

```typescript
new UltimateTextToImage("Agjpqy!", {useGlyphPadding: true, underlineSize: 2, backgroundColor: "#00FFFF99"})
```
![sample](https://i.imgur.com/Zzs1uwX.png)

In Browser, we are able to measure the top, right, bottom and left padding precisely. While on server side, left and right padding cannot be returned. 
There will be slightly different on how texts are aligned. You may need to add some margin for some cases as well.

# Notes on using Font

You can use fontFamily: "Arial, Sans, Noto Sans TC" in such way support fall back fonts.

The registeredFont() provided by [Canvas](https://www.npmjs.com/package/canvas) is not very clear documented, and I am not expert on fonts. 
Therefore, I have made various trial and error to draw follow conclusions and suggestions

Considered that you have the Noto Sans TC Regular and Bold Fonts
https://fonts.google.com/specimen/Noto+Sans+TC#license

You can use the fonts in the following way:
```
import {registerFont} from "ultimate-text-to-image";
registerFont("NotoSansTC-Regular.otf", {family: "aliasName", weight: 100}); // fontName: Noto Sans TC
registerFont("NotoSansTC-Bold.otf", {family: "aliasName", weight: "800"}); // fontName: Noto Sans TC

// we use alias font name
// this is just for mapping, it won't really apply bold or italic on the texts, it will just use the font itself
new UltimateTextToImage("text", {fontFamily: "aliasName"}); // Regular
new UltimateTextToImage("text", {fontFamily: "aliasName", fontWeight: 200}); // Regular
new UltimateTextToImage("text", {fontFamily: "aliasName", fontWeight: 400}); // Regular
new UltimateTextToImage("text", {fontFamily: "aliasName", fontWeight: 500}); // Bold
new UltimateTextToImage("text", {fontFamily: "aliasName", fontWeight: 500, fontStyle: "italic"}); // Regular, but the final text has no italic

// we use the actual font name (either loaded in run time or exist in the system)
// this will apply bold / italic if the fonts support
new UltimateTextToImage("text", {fontFamily: "Noto Sans TC", fontWeight: "bold", fontStyle: "italic"}); // final text has bold and italic
```

However, there can be some unexpected behaviour for different fonts
```
// remember to comment previous codes to understand the actual behavior
// registerFont("NotoSansTC-Regular.otf", {family: "aliasName", weight: 100});
// registerFont("NotoSansTC-Bold.otf", {family: "aliasName", weight: "800"});
registerFont("NotoSansTC-Thin.otf", {family: "aliasNameThin"}); // fontName: Noto Sans TC Thin
registerFont("NotoSansTC-Medium.otf", {family: "Noto Sans TC Medium"}); // fontName: Noto Sans Medium

// failed to get the font and produce warning: Pango-WARNING **: 11:59:43.357: couldn't load font "Noto Sans TC 80px", falling back to "Sans 80px", expect ugly output.
// The reason probablyl due to the fact that the canvas library incorrectly mapped the aliasNameThin into "Noto Sans TC", 
// while the actualy name is "Noto Sans TC Thin" (I guess the canvas library used wrong meta to do the mapping)
// if you uncomment registerFont("NotoSansTC-Regular.otf", {family: "aliasName", weight: 100}); 
// things will work again due to the reason that the library will attemp to make a guess and load another fonts with similar name
new UltimateTextToImage("text", {fontFamily: "aliasNameThin"}); 

// While this is ok now
new UltimateTextToImage("text", {fontFamily: "Noto Sans TC Thin"}); 

// this will fail. Though you used the correct font name, but the font name is same as the mapping name,
// the library will use the mapping name and incorrect map into "Noto Sans TC" again 
// things will work if you use another alias name: registerFont("NotoSansTC-Medium.otf", {family: "aliasnNameMedium"})
new UltimateTextToImage("text", {fontFamily: "Noto Sans TC Medium"}); 
``` 

** Testing above is done on Windows, the behaviors may be different on Linux
 
As a final conclusion, I you to install the font into system and use actual font name to reduce any unclear outcome. 
You can still use registerFont, but be sure you did enough testing on it.    

# Fonts in browser
If you wanted to use more fonts in browser, please check out [webfontloader](https://github.com/typekit/webfontloader#events). 
If you are using the React component, please refresh the component after font loaded.  

# Performance and caching
The library will cache the measured size of words to achieve responsive rendering. In case you added some new fonts, you can run the following code to clear cache

```typescript
// cache is stored in run time, restarting your program will also clear the cache
UltimateTextToImage.measurable.clearCache();
```

# Know issues
- line break checking for emoji may not work perfectly
- width checking for 8 bytes emoji may have problem

# Useful links
- http://torinak.com/font/lsfont.html
- https://fonts.google.com/specimen/Noto+Sans+TC#license
- https://www.npmjs.com/package/canvas
- https://www.npmjs.com/package/linebreak-next

