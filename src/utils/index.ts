import {IFontWeight, IFontStyle} from "../types";

export const getFontString = (options: {fontStyle?: IFontStyle, fontWeight?: IFontWeight, fontSize: number, fontFamily: string}) => {
    const styleStrings: string[] = [];
    if (options.fontStyle) {
        if (typeof options.fontStyle === "boolean") {
            styleStrings.push(`italic`);
        } else {
            styleStrings.push(options.fontStyle);
        }
    }

    if (options.fontWeight) {
        if (typeof options.fontWeight === "boolean") {
            styleStrings.push(`bold`);
        } else {
            styleStrings.push(options.fontWeight.toString());
        }
    }

    styleStrings.push(`${options.fontSize}px`);
    styleStrings.push(`"${options.fontFamily}"`);

    return styleStrings.join(" ");
};

export const parseColorString = (value: string | number) => {
    const {r, g, b, a} = parseColor(value);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const parseColor = (value: string | number) => {
    if (typeof value === "string") {
        value = value.replace(/^0x/i, "");
        value = value.replace(/^#/, "");

        const r = parseHexTo255(value.substr(0, 2), 0);
        const g = parseHexTo255(value.substr(2, 2), 0);
        const b = parseHexTo255(value.substr(4, 2), 0);
        const a = parseHexTo255(value.substr(6, 2), 255) / 255;
        return {r, g, b, a};
    } else {
        if (value <= 0xFFFFFF) {
            const r = (value >> 16) & 0xFF;
            const g = (value >> 8) & 0xFF;
            const b = (value >> 0) & 0xFF;
            const a = 1;
            return {r, g, b, a};

        } else {
            const r = (value >> 24) & 0xFF;
            const g = (value >> 16) & 0xFF;
            const b = (value >> 8) & 0xFF;
            const a = ((value >> 0) & 0xFF) / 255;
            return {r, g, b, a};
        }
    }
};

export const parseHexTo255 = (value: string, defaultValue: number) => {
    try {
        if (value) {
            const decimal = parseInt(`0x${value}`, 16);
            if (!isNaN(decimal)) {
                return Math.max(0, Math.min(decimal, 255));
            }
        }
    } catch (err) {
        // ignore any error
    }

    return defaultValue;
};

export const hrtime = (previousHrTime?: [number, number]): [number, number] => {
    if (process && process.hrtime) {
        return process.hrtime(previousHrTime);

    } else {
        const performance = window.performance;
        const baseNow = Math.floor((Date.now() - performance.now()) * 1e-3);
        const clocktime = performance.now() * 1e-3;
        let seconds = Math.floor(clocktime) + baseNow;
        let nanoseconds = Math.floor((clocktime % 1) * 1e9);

        if (previousHrTime) {
            seconds = seconds - previousHrTime[0];
            nanoseconds = nanoseconds - previousHrTime[1];
            if (nanoseconds < 0) {
                seconds--;
                nanoseconds += 1e9;
            }
        }

        return [seconds, nanoseconds];
    }
};

