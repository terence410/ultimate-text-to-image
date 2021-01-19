declare module "linebreak-next" {
    export type INextBreakResult = {position: number, required: boolean} | null;
    export default class Linebreak {
        constructor(text: string);
        public nextBreak(): INextBreakResult;
    }
}
