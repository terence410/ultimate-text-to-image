import React from "react";
import {IOptions} from "./types";
import {UltimateTextToImage} from "./UltimateTextToImage";

type IProps = { text: string, debug?: boolean} & IOptions;

export class UltimateTextToImageComponent extends React.Component<IProps, any> {
    public ultimateTextToImage?: UltimateTextToImage;

    public render() {
        const {text, debug, ...options} = this.props;

        this.ultimateTextToImage = new UltimateTextToImage(text, options);
        this.ultimateTextToImage.render();

        const dataUrl = this.ultimateTextToImage.toDataUrl();
        const {width, height, renderedTime, measuredParagraph} = this.ultimateTextToImage;

        if (debug) {
            return <span>
                <img alt="" src={dataUrl} width={width} height={height}/>
                <br/>
                size: {width}x{height}, font size: {measuredParagraph.fontSize}, render time: {Math.round(renderedTime * 100) / 100}ms
            </span>;

        } else {
            return <img alt="" src={dataUrl} width={width} height={height}/>;
        }
    }
}
