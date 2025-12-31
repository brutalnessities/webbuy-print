import { PrintData } from "./types";
import { LitElement } from "lit-element";
export declare function renderPrint(data: PrintData): Promise<string>;
export declare class PrintComponent extends LitElement {
    constructor();
    render(): import("lit-html").TemplateResult<1>;
}
