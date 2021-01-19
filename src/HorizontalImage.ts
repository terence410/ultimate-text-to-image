import {Canvas} from "canvas";
import {BaseClass} from "./BaseClass";
import {IHorizontalImageOptions, IRenderOptions} from "./types";
import {drawBackgroundColor, renderHook} from "./utils/canvas";

export class HorizontalImage extends BaseClass {
    constructor(public ultimateTextToImages: BaseClass[],
                public options: Partial<IHorizontalImageOptions> = {},
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

        const width = this.ultimateTextToImages.reduce((a, b) => a + b.width, 0) + margin * 2;
        const height = this.ultimateTextToImages
            .reduce((a, b) => Math.max(a, b.height), 0) + margin * 2;

        this._canvas = new Canvas(width, height);
        const ctx = this._canvas.getContext("2d");

        // hook
        renderHook(this._canvas, this.renderOptions.preRender);

        // draw background
        drawBackgroundColor(ctx, {color: backgroundColor});

        let x = margin;
        let y = 0;
        for (const ultimateTextToImage of this.ultimateTextToImages) {
            let valign: string | undefined = this.options.valign;

            if (ultimateTextToImage.options.nestedValign) {
                valign = ultimateTextToImage.options.nestedValign;
            }

            if (valign === "bottom") {
                y = height - ultimateTextToImage.height - margin;

            } else if (valign === "middle") {
                y = (height - ultimateTextToImage.height) / 2;

            } else {
                y = margin;

            }

            ctx.drawImage(ultimateTextToImage.canvas, x, y);
            x += ultimateTextToImage.width;
        }

        // hook
        renderHook(this._canvas, this.renderOptions.posRender);

        this._endTimer();

        return this;
    }

}
