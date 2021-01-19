import * as canvas from "canvas";
import crypto from "crypto";
import {IFontStyle, IFontWeight} from "./types";

export const registerFont = (filename: string, options?: {family?: string, weight?: IFontWeight, style?: IFontStyle}) => {
    const family = options?.family || generateRandomString(16);
    const weight: undefined | string =
        typeof options?.weight === "boolean" ? (options.weight ? "bold" : undefined) : (options?.weight ? options.weight.toString() : undefined);
    const style: undefined | string =
        typeof options?.style === "boolean" ? (options.style ? "italic" : undefined) : (options?.style ? options.style : undefined);

    canvas.registerFont(filename, {family, weight, style});
};

function generateRandomString(length: number) {
    const value = crypto.randomBytes(Math.ceil(length / 2)).toString("hex");
    return value.substr(0, length);
}
