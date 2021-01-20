import {getCanvasImage} from "./getCanvasImage";
import {HorizontalImage} from "./HorizontalImage";
import {registerFont} from "./registerFont";
import {
    ICanvas,
    ICanvasImage,
    IContext2D,
    IFontStyle,
    IFontWeight,
    IHorizontalImageOptions,
    IImage,
    IOptions,
    IRepeat,
    IVerticalImageOptions,
} from "./types";
import {UltimateTextToImage} from "./UltimateTextToImage";
import {UnicodeLineBreak} from "./UnicodeLineBreak";
import {VerticalImage} from "./VerticalImage";

export {
    getCanvasImage,
    registerFont,

    // class
    UltimateTextToImage,
    HorizontalImage,
    VerticalImage,
    UnicodeLineBreak,

    // types
    IRepeat,
    IFontWeight,
    IFontStyle,
    IOptions,
    IVerticalImageOptions,
    IHorizontalImageOptions,
    IImage,
    ICanvasImage,
    ICanvas,
    IContext2D,
};
