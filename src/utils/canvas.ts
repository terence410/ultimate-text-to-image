import {createCanvas} from "canvas";
import {ICanvas, IContext2D, IDrawTextOptions, IImage} from "../types";
import {getFontString, parseColorString} from "./index";

/** @internal */
export function renderHook(canvas: ICanvas, hook: ((canvas: ICanvas) => any) | undefined) {
    if (hook) {
        hook(canvas);
    }
}

/** @internal */
export function drawBackgroundColor(ctx: IContext2D, options: {color?: string | number}) {
    if (options.color || typeof options.color === "number") {
        const {width, height} = ctx.canvas;
        ctx.fillStyle = parseColorString(options.color);
        ctx.fillRect(0, 0, width, height);
    }
}

/** @internal */
export function drawBorder(ctx: IContext2D, options: {color?: string | number, size: number}) {
    if (options.size && (options.color || typeof options.color === "number")) {
        const {width, height} = ctx.canvas;
        ctx.strokeStyle = parseColorString(options.color);
        // multiple by 2 since it's align to center
        ctx.lineWidth = options.size * 2;
        ctx.strokeRect(0, 0, width, height);
    }
}

/** @internal */
export function drawImages(ctx: IContext2D, options: {width: number, height: number, layer: number, images: IImage[]}) {
    const {images} = options;

    const canvasWidth = options.width | 0;
    const canvasHeight = options.height | 0;
    for (const imageSetting of images) {
        const {canvasImage, repeat, sx, sy, tx, ty} = imageSetting;
        const layer = imageSetting.layer || 0;

        // make sure it's a valid image
        if (!canvasImage || !canvasImage.width || !canvasImage.height) {
            continue;
        }

        // check the layer
        if (layer !== options.layer) {
            continue;
        }

        // prepare all dimensions
        const imageWidth = canvasImage.width;
        const imageHeight = canvasImage.height;
        const tempWidth = imageSetting.width === "image" ? imageWidth : (imageSetting.width === "canvas" ? canvasWidth : (imageSetting.width || 0));
        const tempHeight = imageSetting.height === "image" ? imageHeight : (imageSetting.height === "canvas" ? canvasHeight : (imageSetting.height || 0));

        const x = typeof sx === "number" ? (sx >= 0 ? sx : canvasWidth + sx) : (imageSetting.x || 0);
        const y = typeof sy === "number" ? (sy >= 0 ? sy : canvasHeight + sy) : (imageSetting.y || 0);
        const width = typeof tx === "number" ? (tx > 0 ? tx : canvasWidth + tx) - x : (tempWidth || canvasWidth - x);
        const height = typeof ty === "number" ? (ty > 0 ? ty : canvasHeight + ty) - y : (tempHeight || canvasHeight - y);

        // skip if invalid
        if (width <= 0 || height <= 0) {
            continue;
        }

        if (!repeat || repeat === "none" || repeat === "topLeft") {
            ctx.drawImage(canvasImage, 0, 0, width, height,
                x, y, width, height);

        } else if (repeat === "topCenter") {
            const sx1 = (imageWidth - width) / 2;
            ctx.drawImage(canvasImage, sx1, 0, width, height,
                x, y, width, height);

        } else if (repeat === "topRight") {
            const sx1 = imageWidth - width;
            ctx.drawImage(canvasImage, sx1, 0, width, height,
                x, y, width, height);

        } else if (repeat === "middleLeft") {
            const sy1 = (imageHeight - height) / 2;
            ctx.drawImage(canvasImage, 0, sy1, width, height,
                x, y, width, height);

        } else if (repeat === "center") {
            const sx1 = (imageWidth - width) / 2;
            const sy1 = (imageHeight - height) / 2;
            ctx.drawImage(canvasImage, sx1, sy1, width, height,
                x, y, width, height);

        } else if (repeat === "middleRight") {
            const sx1 = imageWidth - width;
            const sy1 = (imageHeight - height) / 2;
            ctx.drawImage(canvasImage, sx1, sy1, width, height,
                x, y, width, height);

        } else if (repeat === "bottomLeft") {
            const sy1 = imageHeight - height;
            ctx.drawImage(canvasImage, 0, sy1, width, height,
                x, y, width, height);

        } else if (repeat === "bottomCenter") {
            const sx1 = (imageWidth - width) / 2;
            const sy1 = imageHeight - height;
            ctx.drawImage(canvasImage, sx1, sy1, width, height,
                x, y, width, height);

        } else if (repeat === "bottomRight") {
            const sx1 = imageWidth - width;
            const sy1 = imageHeight - height;
            ctx.drawImage(canvasImage, sx1, sy1, width, height,
                x, y, width, height);

        } else if (repeat === "fit") {
            ctx.drawImage(canvasImage, 0, 0, imageWidth, imageHeight,
                x, y, width, height);

        } else if (repeat === "fitX") {
            const finalImageHeight = Math.min(height, imageHeight);
            ctx.drawImage(canvasImage, 0, 0, imageWidth, finalImageHeight,
                x, y, width, finalImageHeight);

        } else if (repeat === "fitY") {
            const finalImageWidth = Math.min(x + width - x, imageWidth);
            ctx.drawImage(canvasImage, 0, 0, finalImageWidth, imageHeight,
                x, y, finalImageWidth, height);

        } else if (repeat === "repeat") {
            for (let y1 = y; y1 < y + height; y1 += imageHeight) {
                for (let x1 = x; x1 < x + width; x1 += imageWidth) {
                    const finalImageWidth = Math.min(x + width - x1, imageWidth);
                    const finalImageHeight = Math.min(y + height - y1, imageHeight);
                    ctx.drawImage(canvasImage, 0, 0, finalImageWidth, finalImageHeight,
                        x1, y1, finalImageWidth, finalImageHeight);
                }
            }
        } else if (repeat === "repeatY") {
            for (let y1 = y; y1 < y + height; y1 += imageHeight) {
                const finalImageWidth = Math.min(x + width - x, imageWidth);
                const finalImageHeight = Math.min(y + height - y1, imageHeight);
                ctx.drawImage(canvasImage, 0, 0, finalImageWidth, finalImageHeight,
                    x, y1, finalImageWidth, finalImageHeight);
            }
        } else if (repeat === "repeatX") {
            for (let x1 = x; x1 < x + width; x1 += imageWidth) {
                const finalImageWidth = Math.min(x + width - x1, imageWidth);
                const finalImageHeight = Math.min(y + height - y, imageHeight);
                ctx.drawImage(canvasImage, 0, 0, finalImageWidth, finalImageHeight,
                    x1, y, finalImageWidth, finalImageHeight);
            }
        }
    }
}

/** @internal */
export function drawTexts(ctx: IContext2D, options: IDrawTextOptions) {
    const {
        measuredParagraph,
        width, height,
        fontFamily, fontStyle, fontWeight, fontSize, fontColor, strokeSize, strokeColor,
        valign, align,
        marginLeft, marginTop, marginRight, marginBottom, chopOverflow, useGlyphPadding,
        underlineSize, underlineColor,
        shadowColor, shadowBlur, shadowBlurLineWidth,
    } = options;

    // return immediately if nothing to draw
    if (!measuredParagraph.measuredLines.length) {
        return;
    }

    const textCanvasWidth = useGlyphPadding ? measuredParagraph.boundingWidth : measuredParagraph.width;
    const textCanvasHeight = useGlyphPadding ? measuredParagraph.boundingHeight : measuredParagraph.height;
    // we add extra height (just fontSize) to make sure we able to draw characters with boxDescent
    const renderMargin = Math.round(fontSize / 2);
    const textCanvas = createCanvas(textCanvasWidth + renderMargin * 2, textCanvasHeight + renderMargin * 2);
    const parsedFontColor = parseColorString(fontColor);
    const parsedUnderlineStyle = parseColorString(underlineColor);
    const textCtx = textCanvas.getContext("2d");
    textCtx.font = getFontString({fontStyle, fontWeight, fontSize, fontFamily});

    // we draw everything cuz align may need to display different parts (this can be optimized a bit if necessary)
    let y = useGlyphPadding ? fontSize + measuredParagraph.measuredLines[0].paddingTop : fontSize;
    for (const measuredLine of measuredParagraph.measuredLines) {
        let x = 0;

        if (align === "center") {
            x = (textCanvasWidth - measuredLine.width) / 2;

            if (useGlyphPadding) {
                x = (textCanvasWidth - (measuredLine.width - measuredLine.paddingLeft + measuredLine.paddingRight)) / 2;
            }

        } else if (align === "right") {
            x = textCanvasWidth - measuredLine.width;

            if (useGlyphPadding) {
                x = textCanvasWidth - measuredLine.width - measuredParagraph.paddingRight;
            }
        } else {
            if (useGlyphPadding) {
                x = measuredParagraph.paddingLeft;
            }
        }

        // draw underline
        if (underlineSize) {
            textCtx.fillStyle = parsedUnderlineStyle;
            textCtx.fillRect(x + renderMargin, y + renderMargin, measuredLine.width, underlineSize);
        }

        // draw the text
        textCtx.fillStyle = parsedFontColor;
        textCtx.fillText(measuredLine.text, x + renderMargin, y + renderMargin);

        // draw the stoke if have
        if (strokeSize) {
            textCtx.strokeStyle = parseColorString(strokeColor);
            textCtx.lineWidth = strokeSize;
            textCtx.strokeText(measuredLine.text, x + renderMargin, y + renderMargin);
        }

        // draw the shadow if have
        if (shadowColor) {
            const parsedShadowColor = parseColorString(shadowColor);

            textCtx.shadowColor = parsedShadowColor;
            textCtx.shadowBlur = shadowBlur;
            textCtx.lineWidth = shadowBlurLineWidth;
            textCtx.strokeText(measuredLine.text, x + renderMargin, y + renderMargin);

            textCtx.strokeStyle = parsedShadowColor;
            textCtx.strokeText(measuredLine.text, x + renderMargin, y + renderMargin);

            textCtx.shadowBlur = 0;
            textCtx.fillStyle = parsedFontColor;
            textCtx.fillText(measuredLine.text, x + renderMargin, y + renderMargin);
        }

        // advance y
        y += (measuredLine.nextLineHeight);
    }

    // // if we want more precise spacing
    let sx = 0;
    let sy = 0;
    let tx = 0;
    let ty = 0;
    let sWidth = width;
    let sHeight = height;

    // measure what to display for align
    if (align === "right") {
        sx = textCanvasWidth - width + marginRight;

        if (chopOverflow) {
            tx += marginLeft;
            sx += marginLeft;
            sWidth = width - marginLeft - marginRight;
        }

    } else if (align === "center") {
        sx = (textCanvasWidth - width - marginLeft + marginRight) / 2;

        if (chopOverflow) {
            tx += marginLeft;
            sx += marginLeft;
            sWidth = width - marginLeft - marginRight;
        }

    } else { // left
        sx = -marginLeft;

        if (chopOverflow) {
            sWidth = width - marginRight;
        }
    }

    // measure what to display for valign
    if (valign === "bottom") {
        sy = textCanvasHeight - height + marginBottom;

        if (chopOverflow) {
            ty += marginTop;
            sy += marginTop;
            sHeight = height - marginTop - marginBottom;
        }

    } else if (valign === "middle") {
        sy = (textCanvasHeight - height - marginTop + marginBottom) / 2;

        if (chopOverflow) {
            ty += marginTop;
            sy += marginTop;
            sHeight = height - marginTop - marginBottom;
        }

    } else {  // top
        sy = -marginTop;

        if (chopOverflow) {
            sHeight = height - marginBottom;
        }
    }

    // draw the image
    ctx.drawImage(textCanvas,
        sx + renderMargin, sy + renderMargin, sWidth, sHeight,
        tx, ty, sWidth, sHeight,
    );
}
