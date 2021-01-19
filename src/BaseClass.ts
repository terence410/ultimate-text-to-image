import {Canvas, CanvasRenderingContext2D, createCanvas, JpegConfig, JPEGStream, PngConfig, PNGStream} from "canvas";
import fs from "fs";
import {IBaseOptions, IOptions, IVerticalImageOptions} from "./types";
import {UltimateTextToImage} from "./UltimateTextToImage";
import {hrtime} from "./utils";

export class BaseClass {
    public options: Partial<IBaseOptions> = {};
    protected _canvas?: Canvas;
    private _renderedTime = 0;
    private _before: [number, number] = [0, 0];

    public get hasRendered() {
        return !!this._canvas;
    }

    public get canvas() {
        this._checkHasRendered();
        return this._canvas!;
    }

    public get renderedTime() {
        this._checkHasRendered();
        return this._renderedTime;
    }

    public get width() {
        this._checkHasRendered();
        return this.canvas!.width;
    }

    public get height() {
        this._checkHasRendered();
        return this.canvas!.height;
    }

    public render() {
        return this;
    }

    public toDataUrl(mineType?: "image/png"): string;
    public toDataUrl(mineType: "image/jpeg", options?: {quality?: number}): string;
    public toDataUrl(mineType: string = "image/png", options?: {quality?: number}) {
        this._checkHasRendered();

        if (mineType === "image/png") {
            return this.canvas!.toDataURL("image/png");
        } else {
            return this.canvas!.toDataURL("image/jpeg", options?.quality);
        }
    }

    public toBuffer(mineType?: "image/png", options?: PngConfig): Buffer;
    public toBuffer(mineType: "image/jpeg", options?: JpegConfig): Buffer;
    public toBuffer(mineType: string = "image/png", options?: any) {
        this._checkHasRendered();

        if (mineType === "image/png") {
            return this.canvas!.toBuffer("image/png", options);
        } else {
            return this.canvas!.toBuffer("image/jpeg", options);
        }
    }

    public toFile(filename: string, mineType?: "image/png", options?: PngConfig): void;
    public toFile(filename: string, mineType: "image/jpeg", options?: JpegConfig): void;
    public toFile(filename: string, mineType: string = "", options?: any) {
        this._checkHasRendered();

        if (!mineType) {
            if (filename.match(/\.jpg$|\.jpeg$/i)) {
                mineType = "image/jpeg";
            } else {
                mineType = "image/png";
            }
        }

        const buffer = this.toBuffer(mineType as any, options);
        fs.writeFileSync(filename, buffer);
    }

    public toStream(mineType?: "image/png", options?: PngConfig): PNGStream;
    public toStream(mineType: "image/jpeg", options?: JpegConfig): JPEGStream;
    public toStream(mineType: string = "image/png", options?: any) {
        this._checkHasRendered();

        if (mineType === "image/png") {
            return this.canvas!.createPNGStream(options);
        } else {
            return this.canvas!.createJPEGStream(options);
        }
    }

    protected _checkHasRendered() {
        if (!this.hasRendered) {
            throw new Error(`Please run render() first!`);
        }
    }

    protected _startTimer() {
        this._before = hrtime();
    }

    protected _endTimer() {
        const diff = hrtime(this._before);
        this._renderedTime = diff[0] * 1000 + (diff[1] / 1000000);
    }
}
