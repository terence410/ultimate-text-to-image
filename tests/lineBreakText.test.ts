import { assert, expect } from "chai";
import {UnicodeLineBreak} from "../src/UnicodeLineBreak";

describe("Text Line Break Test", () => {
    it("basic", async () => {
        const testCases: Array<[string, any[]]> = [
            [`abcd XYZ    123 789 `, ["abcd ", "XYZ    ", "123 ", "789 "]],
            [`abcd XYZ    \n 123 \r\n\r\n\n   789 `, ["abcd ", "XYZ    ", " ", "123 ", "", "", "   ", "789 "]],
            [``, []],
            [` `, [" "]],
            [` \n `, [" ", " "]],
            [` \n\n\n `, [" ", "", "", " "]],
            [`一二三\n六七`, ["一", "二", "三", "六", "七"]],
        ];

        for (const [text, testResults] of testCases) {
            const unicodeLineBreak = new UnicodeLineBreak(text);
            const results = unicodeLineBreak.getResults();
            assert.deepEqual(results.map(x => x.word), testResults);
        }
    });
});
