import { assert, expect } from "chai";
import { LoremIpsum } from "lorem-ipsum";
import path from "path";
import {getCanvasImage, registerFont, UltimateTextToImage} from "../src/";
import {HorizontalImage} from "../src/HorizontalImage";
import {ICanvas} from "../src/types";
import {VerticalImage} from "../src/VerticalImage";

describe("General", () => {
    before(async () => {
        registerFont(path.join(__dirname, "./fonts/NotoSansTC-Regular.otf"), {family: "aliasName", weight: 100});
        registerFont(path.join(__dirname, "./fonts/NotoSansTC-Bold.otf"), {family: "aliasName", weight: 800});
        registerFont(path.join(__dirname, "./fonts/NotoSansTC-Black.otf"), {family: "aliasNameBlack"});
        registerFont(path.join(__dirname, "./fonts/NotoSansTC-Medium.otf"), {family: "Noto Sans TC Medium"});
    });

    it("empty", async () => {
        const textToImage = new UltimateTextToImage("").render();
        textToImage.toFile(path.join(__dirname, "imageEmpty1.png"));

        const {measuredParagraph, width, height, hasRendered, renderedTime, canvas} = textToImage;
        assert.isAtLeast(renderedTime, 0);
        assert.equal(hasRendered, true);
        assert.equal(width, 1);
        assert.equal(height, 1);
        assert.deepEqual(measuredParagraph.measuredLines, []);
        assert.isDefined(canvas);
        assert.equal(textToImage.measuredParagraph.width, 0);
        assert.equal(textToImage.measuredParagraph.height, 0);
    });

    it("number", async () => {
        const texts = [`0123456789`, `零一二三四五六七八九`, `영일이삼사오육칠팔구십`];

        const textToImage = new UltimateTextToImage(texts.join("\n"), {
            align: "center",
            valign: "middle",
        }).render();
        textToImage.toFile(path.join(__dirname, "imageNumber1.png"));
        assert.deepEqual(textToImage.measuredParagraph.measuredLines.map(x => x.text), texts);
    });

    it("ascii", async () => {
        const text = Array(255).fill(0).map((x, i) => String.fromCharCode(i)).join("");
        const textToImage = new UltimateTextToImage(text, {backgroundColor: ""}).render();
        textToImage.toFile(path.join(__dirname, "imageAscii1.png"));
    });

    it("emoji", async () => {
        const text = "😀😃😄😁😆😅🤣😂😝🤑🤗🤭🤫🤔🤐🤨";
        const textToImage = new UltimateTextToImage(text).render();
        textToImage.toFile(path.join(__dirname, "imageEmoji1.png"), "image/png", {
            compressionLevel: 9,
            backgroundIndex: 1,
            resolution: 50,
        });
    });

    it("render many times", async () => {
        const lorem = new LoremIpsum({
            sentencesPerParagraph: { max: 8, min: 4 },
            wordsPerSentence: { max: 16, min: 4},
        });

        const total = 100;
        for (let i = 0; i < total; i++) {
            const paragraph = lorem.generateWords(100);
            const textToImage = new UltimateTextToImage(paragraph, {
                width: 600,
                height: 600,
                fontSize: 40,
            }).render();
        }
    });

    it("export", () => {
        const textToImage = new UltimateTextToImage("0123456789", {backgroundColor: "#0080FF99"}).render();
        const buffer1 = textToImage.toBuffer();
        const buffer2 = textToImage.toBuffer("image/png");
        const buffer3 = textToImage.toBuffer("image/jpeg", {quality: 50});
        const buffer4 = textToImage.toBuffer("image/jpeg", {quality: 95, progressive: true, chromaSubsampling: true});
        assert.isTrue(buffer1.equals(buffer2));
        assert.isFalse(buffer1.equals(buffer3));
        assert.isFalse(buffer3.equals(buffer4));

        const dataUrl1 = textToImage.toDataUrl();
        const dataUrl2 = textToImage.toDataUrl("image/jpeg");
        assert.notDeepEqual(dataUrl1, dataUrl2);

        const stream1 = textToImage.toStream();
        const stream2 = textToImage.toStream("image/jpeg");
        assert.notDeepEqual(stream1.read(10234), stream2.read(1024));
    });

    it("error", async () => {
        const textToImage = new UltimateTextToImage("0123456789");
        assert.isFalse(textToImage.hasRendered);
        assert.throw(() => textToImage.toBuffer(), /Please run render/);
        assert.throw(() => textToImage.measuredParagraph, /Please run render/);
        assert.throw(() => textToImage.width, /Please run render/);
        assert.throw(() => textToImage.height, /Please run render/);
        assert.throw(() => textToImage.renderedTime, /Please run render/);
    });

    it("preRender / posRender", async () => {
        const sequences: string[] = [];
        const textToImage = new UltimateTextToImage("0123456789", {}, {
            preRender: (canvas: ICanvas) => {
                sequences.push("pre");
            },
            posRender: (canvas: ICanvas) => {
                sequences.push("pos");
            },
        });

        assert.deepEqual(sequences, []);

        // render
        textToImage.render();
        assert.deepEqual(sequences, ["pre", "pos"]);

        // render one more time
        textToImage.render();
        assert.deepEqual(sequences, ["pre", "pos", "pre", "pos"]);
    });

    it("load image", async () => {
        const buffer = new UltimateTextToImage("", {width: 10, height: 10, backgroundColor: "#000000"})
            .render()
            .toBuffer();
        const url = "https://i.imgur.com/EP7lGGu.jpg";
        const base64 = buffer.toString("base64");
        const arrayBuffer = new Uint8Array(buffer);

        // images
        const canvasImage1 = await getCanvasImage({url});
        const canvasImage2 = await getCanvasImage({base64});
        const canvasImage3 = await getCanvasImage({buffer});
        const canvasImage4 = await getCanvasImage({arrayBuffer});

        const textToImage = new UltimateTextToImage("Multiple Images", {
            width: 600,
            height: 600,
            alignToCenterIfLinesLE: 1,
            backgroundColor: "#FFFFFF99",
            images: [
                {canvasImage: canvasImage1, layer: -1},
                {canvasImage: canvasImage2, layer: 0, repeat: "fit", x: 10, y: 10, width: 10, height: 10},
                {canvasImage: canvasImage3, layer: 1, repeat: "fitX", sx: -200, sy: 100, width: 100, height: 100},
                {canvasImage: canvasImage4, layer: 1, repeat: "repeat", sx: -100, sy: -100, tx: -50, ty: -50},
            ],
        });

        textToImage.render().toFile(path.join(__dirname, "imageLoadImage1.png"));
    });

    it("load image, error", async () => {
        let error1: any;
        try {
            await getCanvasImage({url: "http://localhost/unknown.png"});
        } catch (err) {
            error1 = err;
        }
        assert.isDefined(error1);
        assert.equal(error1.message, "Invalid Image");

        let error2: any;
        try {
            await getCanvasImage({base64: ""});
        } catch (err) {
            error2 = err;
        }
        assert.isDefined(error2);
        assert.equal(error2.message, "Invalid Image");
    });

    it("font", async () => {
        const texts = [`0123456789`, `零一二三四五六七八九`, `abcdefghijklmnopqrstuvwxyz`];
        const textToImage = new UltimateTextToImage(texts.join("\n"), {fontFamily: "hello", alignToCenterIfLinesLE: 10});
        const bufferA1 = textToImage.render().toBuffer();

        // fall back
        textToImage.options.fontFamily = "Sans";
        const bufferA2 = textToImage.render().toBuffer();
        assert.isTrue(bufferA1.equals(bufferA2));

        // use another font
        textToImage.options.fontFamily = "aliasName";
        const bufferB1 = textToImage.render().toBuffer();
        textToImage.toFile(path.join(__dirname, "imageFont1.png"));

        // same weight
        textToImage.options.fontWeight = 200;
        const bufferB2 = textToImage.render().toBuffer();
        assert.isTrue(bufferB1.equals(bufferB2));
        textToImage.toFile(path.join(__dirname, "imageFont2.png"));

        // try different weight on the alias
        textToImage.options.fontWeight = 600;
        const bufferB3 = textToImage.render().toBuffer();
        textToImage.toFile(path.join(__dirname, "imageFont3.png"));

        textToImage.options.fontWeight = 900;
        const bufferB4 = textToImage.render().toBuffer();
        textToImage.toFile(path.join(__dirname, "imageFont4.png"));

        assert.isTrue(bufferB3.equals(bufferB4));
        assert.isFalse(bufferB2.equals(bufferB3));

        // try another font with the alias name, fall back to the bold
        textToImage.options.fontFamily = "aliasNameBlack";
        textToImage.options.fontWeight = false;
        const bufferC1 = textToImage.render().toBuffer();
        textToImage.toFile(path.join(__dirname, "imageFont5.png"));
        // assert.isTrue(bufferB3.equals(bufferC1));
        console.log("bufferC1", bufferC1.equals(bufferA1));
        console.log("bufferC2", bufferC1.equals(bufferA2));

        // this is ok now
        textToImage.options.fontFamily = "Noto Sans TC Black";
        const bufferC2 = textToImage.render().toBuffer();
        textToImage.toFile(path.join(__dirname, "imageFont6.png"));
        assert.isFalse(bufferB3.equals(bufferC2));

        console.log("bufferC2", bufferC2.equals(bufferA1));
        console.log("bufferC2", bufferC2.equals(bufferA2));
        console.log("bufferC2", bufferC2.equals(bufferC1));

        // use the alias name, fall back to regular
        textToImage.options.fontFamily = "Noto Sans TC Medium";
        const bufferD1 = textToImage.render().toBuffer();
        textToImage.toFile(path.join(__dirname, "imageFont7.png"));
        console.log("bufferD1", bufferD1.equals(bufferA1));
        console.log("bufferD2", bufferD1.equals(bufferA2));
        console.log("bufferD2", bufferD1.equals(bufferC1));
        console.log("bufferD2", bufferD1.equals(bufferC2));

        assert.isTrue(bufferB1.equals(bufferD1));
    });

    it("vertical", async () => {
        const textToImage1 = new UltimateTextToImage("Image1",
            {backgroundColor: "#0080FF33", fontSize: 60});
        const textToImage2 = new UltimateTextToImage("Image2 ".repeat(10).trim(),
            {maxWidth: 200, backgroundColor: "#00FF0033", fontSize: 40});
        const textToImage3 = new UltimateTextToImage("Image3 ".repeat(10).trim(),
            {width: 400, height: 400, backgroundColor: "#FF000033", fontSize: 20, align: "right"});

        const verticalImage = new VerticalImage([
            textToImage1,
            textToImage2,
            textToImage3,
        ], {align: "center"});

        verticalImage.render().toFile(path.join(__dirname, "imageVertical1.png"));

        verticalImage.options.backgroundColor = "#FFFFFF";
        verticalImage.render().toFile(path.join(__dirname, "imageVertical2.jpg"));
    });

    it("horizontal", async () => {
        const textToImage1 = new UltimateTextToImage("Image1",
            {backgroundColor: "#0080FF33", fontSize: 60});
        const textToImage2 = new UltimateTextToImage("Image2 ".repeat(10).trim(),
            {maxWidth: 200, backgroundColor: "#00FF0033", fontSize: 40});
        const textToImage3 = new UltimateTextToImage("Image3 ".repeat(10).trim(),
            {width: 400, height: 400, backgroundColor: "#FF000033", fontSize: 20, align: "right"});

        const horizontalImage = new HorizontalImage([
            textToImage1,
            textToImage2,
            textToImage3,
        ], {valign: "bottom"});

        horizontalImage.render().toFile(path.join(__dirname, "imageHorizontal1.png"));
    });

    it("mixed", async () => {
        const textToImage1 = new UltimateTextToImage("Image1",
            {backgroundColor: "#0080FF33", fontSize: 60});
        const textToImage2 = new UltimateTextToImage("Image2 ".repeat(10).trim(),
            {maxWidth: 200, backgroundColor: "#00FF0033", fontSize: 40});
        const textToImage3 = new UltimateTextToImage("Image3 ".repeat(10).trim(),
            {width: 400, height: 400, backgroundColor: "#FF000033", fontSize: 20, align: "right"});

        const mixed1 = new HorizontalImage([
            textToImage1,
            new VerticalImage([textToImage1, textToImage2, textToImage3], {align: "right"}),
            new HorizontalImage([textToImage1, textToImage2, textToImage3], {valign: "middle"}),
        ], {valign: "middle"})
            .render();
        mixed1.toFile(path.join(__dirname, "imageMixed1.png"));

        const mixed2 = new VerticalImage([
            textToImage1,
            new HorizontalImage([textToImage1, textToImage2, textToImage3], {valign: "top"}),
            new VerticalImage([textToImage1, textToImage2, textToImage3], {align: "center"}),
        ], {align: "right"})
            .render();
        mixed2.toFile(path.join(__dirname, "imageMixed2.png"));
    });
});
