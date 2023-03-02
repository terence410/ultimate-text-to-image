import { assert, expect } from "chai";
import fs from "fs";
import path from "path";
// tslint:disable-next-line:no-var-requires
import {getCanvasImage, HorizontalImage, registerFont, UltimateTextToImage, VerticalImage} from "../src";
import {ICanvas} from "../src/types";

describe("Sample", () => {
    it("landing", async () => {
        const greetings = [
            "Hello, Nice to meet you!",
            "你好，很高興認識你！",
            "Hallo, schön dich kennen zu lernen!",
            "Bonjour heureux de vous rencontrer!",
            "こんにちは、はじめまして！",
            "여보세요 만나서 반가워요!",
            "Olá prazer em conhecê-lo!",
            "¡Hola mucho gusto!",
            "你好，很高兴认识你！",
            "Привет! Рад тебя видеть!",
        ];

        const image1 = new UltimateTextToImage("Ultimate Text To Image",
            {fontSize: 40, fontStyle: "italic", fontColor: "#FF0000", margin: 10, useGlyphPadding: false});
        const image2 = new UltimateTextToImage(greetings.join(" "),
            {width: 600, fontSize: 30, fontFamily: "Sans, Droid Sans Fallback, MingLiU", fontStyle: "italic", margin: 10, marginBottom: 20, backgroundColor: 0xFFFF0099});
        const image3 = new UltimateTextToImage("http://npmjs.com/package/ultimate-text-to-image",
            {nestedAlign: "right", fontSize: 18, fontStyle: "italic", fontColor: "#999999", marginLeft: 10, marginRight: 10});

        new VerticalImage([
            image1,
            image2,
            image3,
        ], {align: "center"})
            .render()
            .toFile(path.join(__dirname, "imageLanding1.png"));
    });

    it("quick start", async () => {
        new UltimateTextToImage(`abc xyz 0123456789 零一二三四五六七八九`, {width: 150, fontFamily: "Arial, Sans"})
            .render()
            .toFile(path.join(__dirname, "image1.png"));
    });
    
    it("advanced", async () => {
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
    });

    it("clear cache", async () => {
        UltimateTextToImage.measurable.clearCache();
    });

    it("padding", async () => {
        new UltimateTextToImage("Agjpqy!", {useGlyphPadding: false, underlineSize: 1, backgroundColor: "#00FFFF99"})
            .render()
            .toFile(path.join(__dirname, "imagePadding1.png"));

        new UltimateTextToImage("Agjpqy!", {useGlyphPadding: true, underlineSize: 2, backgroundColor: "#00FFFF99"})
            .render()
            .toFile(path.join(__dirname, "imagePadding2.png"));
    });

    it("export", async () => {
        const textToImage = new UltimateTextToImage("Hello World").render();
        const dataUrlPng = textToImage.toDataUrl(); // image/png by default
        const dataUrlJpeg = textToImage.toDataUrl("image/jpeg", {quality: 80});

        const buffer = textToImage.toBuffer(); // png by default
        const bufferPng = textToImage.toBuffer("image/png", {compressionLevel: 6});
        const bufferJpeg = textToImage.toBuffer("image/jpeg", {quality: 80, progressive: true});

        const file = textToImage.toFile(path.join(__dirname, "imageExport1")); // png by default
        const filePng = textToImage.toFile(path.join(__dirname, "imageExport2.png")); // detect by file extension
        const fileJpeg = textToImage.toFile(path.join(__dirname, "imageExport3.jpeg"), "image/jpeg", {quality: 80});

        const streamPng = textToImage.toStream(); // png by default
        const streamJpeg = textToImage.toStream("image/jpeg"); // png by default

        // save by stream
        const out = fs.createWriteStream(path.join(__dirname, "imageExport4.png"));
        streamPng.pipe(out);
        await new Promise((resolve, reject) => out.on("finish", resolve).on("error", reject));
    });

    it("adding images", async () => {
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
    });

    it("pre render / post render", async () => {
        const textToImage = new UltimateTextToImage("Rendering", {}, {
            preRender: (canvas: ICanvas) => {
                // before drawing anything on the canvas
            },
            posRender: (canvas: ICanvas) => {
                // after drawing all the texts and images
            },
        }).render();
    });

    it("register font", async () => {
        // register font
        registerFont("./tests/fonts/NotoSansTC-Regular.otf");

        // render the image
        new UltimateTextToImage("Noto Sans TC:\n床前明月光，\n疑是地上霜，\n舉頭望明月，\n低頭思故鄉。", {fontFamily: "Noto Sans TC", fontSize: 30, fontStyle: "italic"})
            .render()
            .toFile(path.join(__dirname, "image4.png"));
    });

    it("mixed", async () => {
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
    });

    it("other 1", async () => {
        const text = Array(100).fill(0).map((x, i) => i.toString()).join(" ");
        const textToImage = new UltimateTextToImage(text, {
            width: 600,
            height: 400,
            maxHeight: 800,

            fontFamily: "Comic Sans MS",
            fontStyle: "italic",
            fontSize: 72,
            fontColor: "#FF0000",
            minFontSize: 20,

            margin: 10,
            marginBottom: 50,

            lineHeightMultiplier: 1.5,
            autoWrapLineHeightMultiplier: 1,

            align: "center",

            underlineSize: 2,
            underlineColor: "#99000033",
            backgroundColor: "#FFFFFF",
        });
        textToImage.render().toFile(path.join(__dirname, "imageOther1.png"));
    });

    it("other 2", async () => {
        const text = "床前明月光，\n疑是地上霜，\n舉頭望明月，\n低頭思故鄉。";
        const textToImage = new UltimateTextToImage(text, {
            width: 600,
            height: 600,

            fontFamily: "Sans",
            fontStyle: true,
            fontWeight: true,
            fontSize: 30,
            fontColor: "#0080FF",

            align: "right",
            valign: "bottom",
        });
        textToImage.render().toFile(path.join(__dirname, "imageOther2.png"));
    });

    it("other 3", async () => {
        const text = "HelloWorld                                                                           !.,?-";
        const textToImage = new UltimateTextToImage(text, {
            width: 600,
            height: 600,
            fontSize: 50,
            minFontSize: 5,
            alignToCenterIfLinesLE: 1,
        });
        textToImage.render().toFile(path.join(__dirname, "imageOther3.png"));
    });

    it("shadow", async () => {
        const text = "Text with shadow";
        const textToImage = new UltimateTextToImage(text, {
            width: 600,
            height: 600,
            fontSize: 50,
            alignToCenterIfLinesLE: 1,
            fontColor: '#ffffff',
            backgroundColor: '#ffffff',
            shadowColor: '#000000',
            shadowBlur: 10,
            shadowBlurLineWidth: 2,
        });
        textToImage.render().toFile(path.join(__dirname, "imageTextWithShadow.png"));
    });

    it("no shadow", async () => {
        const text = "Text without shadow";
        const textToImage = new UltimateTextToImage(text, {
            width: 600,
            height: 600,
            fontSize: 50,
            alignToCenterIfLinesLE: 1,
            fontColor: '#000000',
            backgroundColor: '#ffffff',
            shadowColor: undefined,
            shadowBlur: 0,
            shadowBlurLineWidth: 0,
        });
        textToImage.render().toFile(path.join(__dirname, "imageTextWithoutShadow.png"));
    });
});
