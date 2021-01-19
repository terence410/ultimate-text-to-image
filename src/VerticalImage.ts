import {Canvas} from "canvas";
import {BaseClass} from "./BaseClass";
import {IRenderOptions, IVerticalImageOptions} from "./types";
import {drawBackgroundColor, renderHook} from "./utils/canvas";

export class VerticalImage extends BaseClass {
    constructor(public ultimateTextToImages: BaseClass[],
                public options: Partial<IVerticalImageOptions> = {},
                public renderOptions: Partial<IRenderOptions> = {},
    ) {
        super();
    }

    public render() {
        this._startTimer();

        const {backgroundColor} = this.options;
        const margin = this.options.margin || 0;

        for (const ultimateTextToImage of this.ultimateTextToImages) {
            ultimateTextToImage.render();
        }

        const width = this.ultimateTextToImages
            .reduce((a, b) => Math.max(a, b.width), 0) + margin * 2;
        const height = this.ultimateTextToImages.reduce((a, b) => a + b.height, 0) + margin * 2;

        this._canvas = new Canvas(width, height);
        const ctx = this._canvas.getContext("2d");

        // hook
        renderHook(this._canvas, this.renderOptions.preRender);

        // draw background
        drawBackgroundColor(ctx, {color: backgroundColor});

        let x = 0;
        let y = margin;
        for (const ultimateTextToImage of this.ultimateTextToImages) {
            let align: string | undefined = this.options.align;

            if (ultimateTextToImage.options.nestedAlign) {
                align = ultimateTextToImage.options.nestedAlign;
            }

            if (align === "right") {
                x = width - ultimateTextToImage.width - margin;

            } else if (align === "center") {
                x = (width - ultimateTextToImage.width) / 2;

            } else {
                x = margin;

            }

            ctx.drawImage(ultimateTextToImage.canvas, x, y);
            y += ultimateTextToImage.height;
        }

        // hook
        renderHook(this._canvas, this.renderOptions.posRender);

        this._endTimer();

        return this;
    }

}
