import {createCanvas} from "canvas";
import {UnicodeLineBreak} from "./UnicodeLineBreak";
import {
    IMeasurable,
    IMeasuredLine,
    IMeasuredParagraph,
    IMeasuredParagraphOptions,
    IMeasuredWord,
    ITestBestMeasuredParagraphOptions,
    ITestMeasuredParagraphOptions,
    ITestMeasuredWordGroupOptions,
    ITestMeasuredWordOptions,
} from "./types";
import {getFontString} from "./utils";

export class Measurable {
    public caches: Map<string, Map<number, Map<string, IMeasurable>>> = new Map();

    public clearCache() {
        this.caches.clear();
    }

    public getMeasuredParagraph(options: IMeasuredParagraphOptions): IMeasuredParagraph {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext("2d");
        return this.testBestMeasuredParagraph({ctx, ...options});
    }

    // the logic below may cause the last checking run one more time (but it's ok since things are cached)
    public testBestMeasuredParagraph(options: ITestBestMeasuredParagraphOptions): IMeasuredParagraph {
        const {maxWidth, maxHeight, maxFontSize, minFontSize, fontSize, ...otherOptions} = options;
        const measuredParagraph = this.testMeasuredParagraph({...otherOptions, maxWidth, fontSize});

        const currentHeight = options.useGlyphPadding ? measuredParagraph.boundingHeight : measuredParagraph.height;
        const currentWidth = options.useGlyphPadding ? measuredParagraph.boundingWidth : measuredParagraph.width;

        // if height is within range
        if (currentHeight <= maxHeight && currentWidth <= maxWidth) {
            // we still can try to do searching
            if (options.maxFontSize > measuredParagraph.fontSize) {
                const newFontSize = Math.ceil((options.fontSize + options.maxFontSize) / 2);
                return this.testBestMeasuredParagraph({
                    ...options,
                    fontSize: newFontSize,
                    minFontSize: measuredParagraph.fontSize,
                });
            } else {
                return measuredParagraph;
            }
        } else {
            // if we have smaller available font size
            if (options.minFontSize < measuredParagraph.fontSize) {
                // we try an Log(N) guess
                const newFontSize = Math.floor((options.fontSize + options.minFontSize) / 2);
                return this.testBestMeasuredParagraph({
                    ...options,
                    fontSize: newFontSize,
                    maxFontSize: measuredParagraph.fontSize - 1,
                });

            } else {
                return measuredParagraph;
            }
        }
    }

    // give information of all the lines
    private testMeasuredParagraph(options: ITestMeasuredParagraphOptions) {
        const {
            ctx,
            text,

            noAutoWrap,
            fontFamily,
            fontStyle,
            fontWeight,
            fontSize,

            lineHeight,
            lineHeightMultiplier,
            autoWrapLineHeight,
            autoWrapLineHeightMultiplier,

            useGlyphPadding,
        } = options;

        const measuredWords = this.testMeasureWords({ctx, text, fontStyle, fontWeight, fontSize, fontFamily});
        const maxWidth = options.maxWidth;

        // prepare settings
        const finalLineHeight = Math.round(typeof lineHeight === "number" ? lineHeight :
            (typeof lineHeightMultiplier === "number" ? fontSize * lineHeightMultiplier : fontSize));
        const finalAutoWrapLineHeight = Math.round(typeof autoWrapLineHeight === "number" ? autoWrapLineHeight :
            (typeof autoWrapLineHeightMultiplier === "number" ? fontSize * autoWrapLineHeightMultiplier : finalLineHeight));

        // find space width first
        const measuredSpace = this.testMeasuredWord({...options, text: " "});
        const spaceWidth = measuredSpace.width;

        // prepare canvas
        let measuredLine: IMeasuredLine = {
            text: "",
            width: 0,
            paddingTop: -fontSize,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            nextLineHeight: 0,
            measuredWords: [],
        };

        const measuredParagraph: IMeasuredParagraph = {
            text,
            width: 0,
            height: 0,
            fontSize,
            fontFamily,
            fontStyle,
            fontWeight,
            spaceWidth,
            boundingHeight: 0,
            boundingWidth: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            measuredLines: [],
        };

        let lastMeasuredWord: IMeasuredWord | undefined;
        for (const measuredWord of measuredWords) {
            // we get the last word spacing information
            let lastWordTotalSpaceWidth = 0;
            let lastWordSpaceCount = 0;
            if (lastMeasuredWord && !lastMeasuredWord.hasLineBreak) {
                lastWordTotalSpaceWidth = lastMeasuredWord.endingSpaceCount * spaceWidth;
                lastWordSpaceCount = lastMeasuredWord.endingSpaceCount;
            }

            // choose which width for calculation
            let currentWidth = measuredLine.width + lastWordTotalSpaceWidth + measuredWord.width;
            if (useGlyphPadding) {
                currentWidth += measuredWord.paddingLeft + measuredWord.paddingRight;
            }

            // if we have auto Wrap & make sure each line within max width
            if (!noAutoWrap && currentWidth > maxWidth) {
                // we go into another line the line contains something already
                if (measuredLine.text) {
                    measuredLine.nextLineHeight = finalAutoWrapLineHeight;
                    measuredParagraph.measuredLines.push(measuredLine);
                }

                // create new line
                measuredLine = {
                    text: measuredWord.text,
                    width: measuredWord.width,
                    paddingTop: measuredWord.paddingTop,
                    paddingBottom: measuredWord.paddingBottom,
                    paddingLeft: measuredWord.paddingLeft,
                    paddingRight: measuredWord.paddingRight,
                    nextLineHeight: 0,
                    measuredWords: [],
                };
            } else {
                // add the word
                measuredLine.text += (" ".repeat(lastWordSpaceCount) + measuredWord.text);
                measuredLine.paddingTop = Math.max(measuredLine.paddingTop, measuredWord.paddingTop);
                measuredLine.paddingBottom = Math.max(measuredLine.paddingBottom, measuredWord.paddingBottom);
                if (measuredLine.width === 0) {
                    measuredLine.paddingLeft = measuredWord.paddingLeft;
                }
                measuredLine.paddingRight = measuredWord.paddingRight;
                measuredLine.width = measuredLine.width + lastWordTotalSpaceWidth + measuredWord.width;
                measuredLine.measuredWords.push(measuredWord);
            }

            /// if it's not last word, do some further processing
            if (!measuredWord.isLastWord) {
                if (measuredWord.hasLineBreak) {
                    measuredLine.nextLineHeight = finalLineHeight;
                    measuredParagraph.measuredLines.push(measuredLine);

                    measuredLine = {
                        text: "",
                        width: 0,
                        paddingTop: -fontSize,
                        paddingBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                        nextLineHeight: 0,
                        measuredWords: [],
                    };
                }
            }

            lastMeasuredWord = measuredWord;
        }

        // if we current measuredLine has width, add it
        if (measuredLine.width) {
            measuredParagraph.measuredLines.push(measuredLine);
        }

        // make sure we have lines
        // compute some final params
        const totalLines = measuredParagraph.measuredLines.length;
        if (totalLines) {
            measuredParagraph.width = measuredParagraph.measuredLines
                .reduce((a, b) => Math.max(a, b.width), 0);
            measuredParagraph.height = measuredParagraph.measuredLines
                .reduce((a, b) => a + b.nextLineHeight, measuredParagraph.fontSize);

            const paddingTop = measuredParagraph.measuredLines[0].paddingTop;
            const paddingBottom = measuredParagraph.measuredLines[totalLines - 1].paddingBottom;

            measuredParagraph.paddingTop = paddingTop;
            measuredParagraph.paddingBottom = paddingBottom;
            measuredParagraph.boundingHeight = measuredParagraph.height + paddingTop + paddingBottom;
            measuredParagraph.boundingWidth = measuredParagraph.measuredLines.reduce(
                (a, b) => Math.max(a, b.width + b.paddingLeft + b.paddingRight), 0);
            measuredParagraph.paddingLeft = measuredParagraph.measuredLines.reduce(
                (a, b) => Math.max(a, b.paddingLeft), -fontSize);
            measuredParagraph.paddingRight = measuredParagraph.measuredLines.reduce(
                (a, b) => Math.max(a, b.paddingRight), -fontSize);
        }

        return measuredParagraph;
    }

    // give information for all the words
    private testMeasureWords(options: ITestMeasuredWordGroupOptions) {
        const measuredWords: IMeasuredWord[] = [];

        const unicodeLineBreak = new UnicodeLineBreak(options.text);
        for (const item of unicodeLineBreak) {
            const word = item.word;
            const trimmedWord = word.trimRight();
            const measuredWord = this.testMeasuredWord({...options, text: trimmedWord});

            measuredWords.push({
                text: trimmedWord,
                width: measuredWord.width,
                paddingTop: measuredWord.paddingTop,
                paddingBottom: measuredWord.paddingBottom,
                paddingLeft: measuredWord.paddingLeft,
                paddingRight: measuredWord.paddingRight,
                endingSpaceCount: word.length - trimmedWord.length,
                isLastWord: item.isLastWord,
                hasLineBreak: item.hasLineBreak,
            });
        }

        return measuredWords;
    }

    private testMeasuredWord(options: ITestMeasuredWordOptions) {
        const {ctx, text, fontStyle, fontWeight, fontSize, fontFamily} = options;

        const fontString = getFontString({fontStyle, fontWeight, fontSize, fontFamily});
        ctx.font = fontString;

        // create font family map if not exist
        if (!this.caches.has(fontString)) {
            this.caches.set(fontString, new Map());
        }

        // create font size map if not exist
        const fontFamilyMap = this.caches.get(fontString)!;
        if (!fontFamilyMap.has(fontSize)) {
            fontFamilyMap.set(fontSize, new Map());
        }

        // calculate the word width
        const fontSizeMap = fontFamilyMap.get(fontSize)!;

        if (!fontSizeMap.has(text)) {
            const measureText = ctx.measureText(text);
            let paddingLeft = measureText.actualBoundingBoxLeft;
            let paddingRight = measureText.actualBoundingBoxRight - measureText.width;

            // Special Handling: if this is reversed type of language
            if (measureText.width > 0 &&
                measureText.actualBoundingBoxLeft / measureText.width > 0.8 &&
                measureText.actualBoundingBoxRight / measureText.width < 0.2) {
                    paddingLeft = measureText.actualBoundingBoxLeft - measureText.width;
                    paddingRight = measureText.actualBoundingBoxRight;
            }

            // console.log(text, measureText);
            // console.log("measure", `${fontStyle}, left: ${paddingLeft}, right: ${paddingRight}, ${text}`);

            fontSizeMap.set(text, {
                text,
                width: measureText.width,
                paddingTop: measureText.actualBoundingBoxAscent - fontSize,
                paddingBottom: measureText.actualBoundingBoxDescent,
                paddingLeft,
                paddingRight,
            });
        }

        return fontSizeMap.get(text)!;
    }
}
