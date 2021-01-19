import * as canvas from "canvas";
import {concat} from "simple-get";

export const getCanvasImage = async (options: {buffer?: Buffer, base64?: string, url?: string, arrayBuffer?: ReadonlyArray<number> | Uint8Array | ArrayBuffer} ) => {
    if (options.buffer) {
        const newBase64 = `data:image/jpg;base64,${options.buffer.toString("base64")}`;
        return await canvas.loadImage(newBase64);

    } else if (options.arrayBuffer) {
        const newBase64 = `data:image/jpg;base64,${Buffer.from(options.arrayBuffer).toString("base64")}`;
        return await canvas.loadImage(newBase64);

    } else if (options.url) {
        try {
            const buffer = await new Promise<Buffer>((resolve, reject) => {
                concat(options.url!, (err, res, data) => {
                    if (err) {
                        return reject(err);
                    }

                    if (res.statusCode !== 200) {
                        return reject(new Error("Invalid Image"));
                    }

                    resolve(data);
                });
            });

            const newBase64 = `data:image/jpg;base64,${buffer.toString("base64")}`;
            return await canvas.loadImage(newBase64);
        } catch (err) {
            // ignore error
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

    } else if (options.base64) {
        const base64 = options.base64;
        if (base64.indexOf("data:") === 0) {
            return await canvas.loadImage(base64);

        } else {
            const newBase64 = `data:image/jpg;base64,${base64}`;
            return await canvas.loadImage(newBase64);

        }
    }

    throw new Error("Invalid Image");
};

