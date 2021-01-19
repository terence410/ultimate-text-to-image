import {Canvas, CanvasRenderingContext2D, Image} from "canvas";

// region image

export type ICanvas = Canvas;
export type IContext2D = CanvasRenderingContext2D;
export type IFontStyle = boolean | "italic" | "oblique";
export type IFontWeight = boolean | "bold" | "bolder" | "lighter" |
    100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
    "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
export type IRepeat = "fit" | "fitX" | "fitY" |
    "repeat" | "repeatX" | "repeatY" |
    "none" | "topLeft" | "topCenter" | "topRight" | "middleLeft" | "center" | "middleRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
export type ICanvasImage = Image;

export type IImage = {
    canvasImage: ICanvasImage,
    layer?: number,
    repeat?: IRepeat,
    x?: number,
    y?: number,
    width?: number | "image" | "canvas",
    height?: number | "image" | "canvas",
    sx?: number,
    sy?: number,
    tx?: number,
    ty?: number,
};

// endregion

// region library options

// nested options
export type IBaseOptions = {
    nestedAlign: "center" | "left" | "right" | string | undefined,
    nestedValign: "top" | "middle" | "bottom" | string | undefined,
    margin: number;
};

export type IOptions = IBaseOptions & {
    height?: number,
    width?: number,
    maxWidth?: number,
    maxHeight?: number,

    noAutoWrap: boolean,
    fontFamily: string,
    fontWeight: IFontWeight,
    fontStyle: IFontStyle,
    fontColor: string | number,
    fontSize: number,
    minFontSize?: number,
    strokeColor: string | number,
    strokeSize: number,

    lineHeight?: number,
    lineHeightMultiplier?: number,
    autoWrapLineHeight?: number,
    autoWrapLineHeightMultiplier?: number,

    marginLeft?: number,
    marginTop?: number,
    marginRight?: number,
    marginBottom?: number,
    useGlyphPadding: boolean,
    chopOverflow: boolean;

    align: "center" | "left" | "right" | string,
    valign: "top" | "middle" | "bottom" | string,
    alignToCenterIfHeightLE: number,
    alignToCenterIfLinesLE: number,

    backgroundColor: string | number,
    borderColor: string | number,
    borderSize: number,

    underlineColor: string | number,
    underlineSize: number,

    images: IImage[],

};

export type IVerticalImageOptions = IBaseOptions & {
    align: "left" | "center" | "right",
    backgroundColor: string | number,
};

export type IHorizontalImageOptions = IBaseOptions & {
    valign: "top" | "middle" | "bottom",
    backgroundColor: string | number,
};

export type IRenderOptions = {
    preRender: (canvas: ICanvas) => any,
    posRender: (canvas: ICanvas) => any,
};

export type IDrawTextOptions = {
    measuredParagraph: IMeasuredParagraph,

    width: number,
    height: number,

    fontFamily: string,
    fontWeight: IFontWeight,
    fontStyle: IFontStyle,
    fontColor: string | number,
    fontSize: number,
    strokeColor: string | number,
    strokeSize: number,

    valign: string,
    align: string,

    marginLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    chopOverflow: boolean,
    useGlyphPadding: boolean,

    underlineColor: string | number,
    underlineSize: number,
};

// endregion

// region measurable

export type IMeasurable = {
    text: string,
    width: number,
    paddingTop: number, // text bottom span, reference to bottom left
    paddingBottom: number, // text bottom span, reference to bottom left
    paddingLeft: number, // text right span, reference to bottom left
    paddingRight: number, // text left span, reference to bottom left
};

export type IMeasuredWord = IMeasurable & {
    width: number,
    endingSpaceCount: number,
    isLastWord: boolean,
    hasLineBreak: boolean,
};

export type IMeasuredLine = IMeasurable & {
    nextLineHeight: number,
    measuredWords: IMeasuredWord[],
};

export type IMeasuredParagraph = IMeasurable & {
    height: number,
    boundingHeight: number,
    boundingWidth: number,
    fontSize: number,
    fontFamily: string,
    fontWeight: IFontWeight,
    fontStyle: IFontStyle,
    spaceWidth: number,
    measuredLines: IMeasuredLine[],
};

export type IMeasuredParagraphBaseOptions = {
    text: string,
    maxWidth: number,

    noAutoWrap: boolean,
    fontFamily: string,
    fontWeight: IFontWeight,
    fontStyle: IFontStyle,
    fontSize: number,

    lineHeight?: number,
    lineHeightMultiplier?: number,
    autoWrapLineHeight?: number,
    autoWrapLineHeightMultiplier?: number,

    useGlyphPadding: boolean,
};

export type IMeasuredParagraphOptions = IMeasuredParagraphBaseOptions & {
    maxHeight: number,
    maxFontSize: number,
    minFontSize: number,
    useGlyphPadding: boolean,
};

export type ITestMeasuredParagraphOptions = IMeasuredParagraphBaseOptions & {
    ctx: IContext2D,
};

export type ITestBestMeasuredParagraphOptions = IMeasuredParagraphOptions & {
    ctx: IContext2D,
};

export type ITestMeasuredWordOptions = {
    ctx: IContext2D,
    text: string,
    fontFamily: string,
    fontWeight: IFontWeight,
    fontStyle: IFontStyle,
    fontSize: number,
};
export type ITestMeasuredWordGroupOptions = ITestMeasuredWordOptions;

// endregion

// region linebreak module

export type INextBreakResult = {position: number, required: boolean} | null;
export type ILineBreak = {
    new (text: string): ILineBreak;
    nextBreak(): INextBreakResult;
};

export interface ILineBreakIterator<T> {
    next(value?: any): IteratorResult<T>;
}

export type ILineBreakResult = {
    word: string;
    index: number;
    isLastWord: boolean;
    hasLineBreak: boolean;
};
// endregion
