import {ILineBreak, ILineBreakIterator, ILineBreakResult} from "./types";

// tslint:disable-next-line:no-var-requires variable-name
const LineBreakNext = require("linebreak-next") as ILineBreak ;

export class LineBreakText {
    constructor(public text: string) {
        //
    }

    public getResults() {
        const results: ILineBreakResult[] = [];
        for (const item of this) {
            results.push(item);
        }

        return results;
    }

    public [Symbol.iterator](): ILineBreakIterator<ILineBreakResult> {
        const text = this.text;
        const lineBreaker = new LineBreakNext(text);
        let last = 0;

        return {
            next: () => {
                const bk = lineBreaker.nextBreak();
                if (!bk) {
                    return {value: undefined, done: true};
                }

                const word = text
                    .slice(last, bk.position)
                    .replace(/(\r?\n)*$/, "");
                const index = last;
                const isLastWord = bk.position === text.length;
                last = bk.position;

                return  {value: {word, index, hasLineBreak: bk.required, isLastWord}, done: false};
            },
        };
    }
}
