import { createCanvas} from "canvas";
import {BaseClass} from "./BaseClass";
import {Measurable} from "./Measurable";
import {IMeasuredParagraph, IOptions, IRenderOptions} from "./types";
import {drawBackgroundColor, drawBorder, drawImages, drawTexts, renderHook} from "./utils/canvas";

export class UltimateTextToImage extends BaseClass {
    public static measurable = new Measurable();
    public static maxSize = 2 << 14 - 1;

    private _measuredParagraph?: IMeasuredParagraph;
    private _defaultOptions: IOptions = {
        width: undefined,
        height: undefined,
        maxWidth: undefined,
        maxHeight: undefined,

        noAutoWrap: false,
        fontFamily: "Arial",
        fontWeight: false,
        fontStyle: false,
        fontSize: 24,
        minFontSize: undefined,
        fontColor: "#333333",
        strokeSize: 0,
        strokeColor: "#000000",

        lineHeight: undefined,
        lineHeightMultiplier: undefined,
        autoWrapLineHeight: undefined,
        autoWrapLineHeightMultiplier: undefined,

        margin: 0,
        marginLeft: undefined,
        marginTop: undefined,
        marginRight: undefined,
        marginBottom: undefined,
        useGlyphPadding: true,
        chopOverflow: false,

        align: "left",
        valign: "top",
        alignToCenterIfHeightLE: 0,
        alignToCenterIfLinesLE: 0,

        borderColor: "#000000",
        borderSize: 0,
        backgroundColor: "",

        underlineSize: 0,
        underlineColor: "",

        images: [],

        nestedAlign: undefined,
        nestedValign: undefined,

        shadowColor: undefined,
        shadowBlur: 0,
        shadowBlurLineWidth: 0,
    };

    constructor(public  text: string, public options: Partial<IOptions> = {}, public renderOptions: Partial<IRenderOptions> = {}) {
        super();
    }

    public get measuredParagraph() {
        this._checkHasRendered();
        return this._measuredParagraph!;
    }

    public render() {
        this._startTimer();
        this._createCanvas();
        this._endTimer();
        return this;
    }

    // draw the image based on various options
    private _createCanvas() {
        const text = this.text;

        // merge default options
        const options: IOptions = Object.assign(
            {},
            this._defaultOptions,
            this.options,
        );

        // prepare all variables
        const {
            height,
            width,
            noAutoWrap, fontFamily, fontStyle, fontWeight, fontSize,
            chopOverflow, useGlyphPadding, underlineSize, underlineColor,
            images,
            shadowColor, shadowBlur, shadowBlurLineWidth,
        } = options;
        let {maxWidth, maxHeight, minFontSize} = options;

        // work on default values
        maxHeight = typeof maxHeight === "number" ? maxHeight : (typeof height === "number" ? height : UltimateTextToImage.maxSize);
        maxWidth = typeof maxWidth === "number" ? maxWidth : (typeof width === "number" ? width : UltimateTextToImage.maxSize);

        // update max size
        maxWidth = Math.max(width || 1, maxWidth);
        maxHeight = Math.max(height || 1, maxHeight);

        minFontSize = typeof minFontSize === "number" ? minFontSize : options.fontSize;
        const marginLeft = typeof options.marginLeft === "number" ? options.marginLeft : options.margin;
        const marginTop = typeof options.marginTop === "number" ? options.marginTop : options.margin;
        const marginRight = typeof options.marginRight === "number" ? options.marginRight : options.margin;
        const marginBottom = typeof options.marginBottom === "number" ? options.marginBottom : options.margin;

        // find the best measured paragraph
        const measuredParagraph = UltimateTextToImage.measurable.getMeasuredParagraph({
            text,

            maxWidth: maxWidth - marginLeft - marginRight,
            maxHeight: maxHeight - marginTop - marginBottom,

            noAutoWrap,
            fontFamily,
            fontStyle,
            fontWeight,
            maxFontSize: fontSize,
            minFontSize,
            fontSize,
            useGlyphPadding,

            lineHeight: options.lineHeight,
            lineHeightMultiplier: options.lineHeightMultiplier,
            autoWrapLineHeight: options.autoWrapLineHeight,
            autoWrapLineHeightMultiplier: options.autoWrapLineHeightMultiplier,

            shadowColor, shadowBlur, shadowBlurLineWidth,
        });

        // prepared update varaibles
        const finalFontSize = measuredParagraph.fontSize;

        // update the alignments
        let finalValign = options.valign;
        let finalAlign = options.align;
        const desiredCanvasHeight = measuredParagraph.height + marginTop + marginBottom;
        const desiredCanvasBoundingHeight = measuredParagraph.boundingHeight + marginTop + marginBottom;
        const desiredCanvasWidth = measuredParagraph.width + marginLeft + marginRight;
        const desiredCanvasBoundingWidth = measuredParagraph.boundingWidth + marginLeft + marginRight;

        let finalHeight = Math.max(typeof height === "number" ? height : desiredCanvasHeight,
            Math.min(maxHeight, desiredCanvasHeight));
        let finalWidth = Math.max(typeof width === "number" ? width : desiredCanvasWidth,
            Math.min(maxWidth, desiredCanvasWidth));

        if (options.alignToCenterIfHeightLE && measuredParagraph.height <= options.alignToCenterIfHeightLE) {
            finalValign = "middle";
            finalAlign = "center";
        }

        if (options.alignToCenterIfLinesLE && measuredParagraph.measuredLines.length <= options.alignToCenterIfLinesLE) {
            finalValign = "middle";
            finalAlign = "center";
        }

        // if we want more precise spacing
        if (useGlyphPadding) {
            finalHeight = Math.max(typeof height === "number" ? height : desiredCanvasBoundingHeight,
                Math.min(maxHeight, desiredCanvasBoundingHeight));
            finalWidth = Math.max(typeof width === "number" ? width : desiredCanvasBoundingWidth,
                Math.min(maxWidth, desiredCanvasBoundingWidth));
        }

        // update the object values
        finalWidth = Math.max(1, finalWidth);
        finalHeight = Math.max(1, finalHeight);
        this._measuredParagraph = measuredParagraph;
        this._canvas = createCanvas(finalWidth, finalHeight);
        const ctx = this._canvas.getContext("2d");

        // hook
        renderHook(this._canvas, this.renderOptions.preRender);

        // draw images
        drawImages(ctx, {width: finalWidth, height: finalHeight, layer: -1, images});

        // draw background
        drawBackgroundColor(ctx, {color: options.backgroundColor});

        // draw border
        drawBorder(ctx, {color: options.borderColor, size: options.borderSize});

        // draw images
        drawImages(ctx, {width: finalWidth, height: finalHeight, layer: 0, images});

        // draw texts
        drawTexts(ctx, {
            measuredParagraph,

            width: finalWidth,
            height: finalHeight,

            fontFamily,
            fontStyle: options.fontStyle,
            fontWeight: options.fontWeight,
            fontSize: finalFontSize,
            fontColor: options.fontColor,
            strokeSize: options.strokeSize,
            strokeColor: options.strokeColor,

            valign: finalValign,
            align: finalAlign,

            // margin: options.margin,
            marginLeft,
            marginTop,
            marginRight,
            marginBottom,
            chopOverflow,
            useGlyphPadding,

            underlineSize,
            underlineColor,

            shadowColor: options.shadowColor,
            shadowBlur: options.shadowBlur,
            shadowBlurLineWidth: options.shadowBlurLineWidth,
        });

        drawImages(ctx, {width: finalWidth, height: finalHeight, layer: 1, images});

        // hook
        renderHook(this._canvas, this.renderOptions.posRender);

        return this._canvas;
    }
}
