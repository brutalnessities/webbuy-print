import Handlebars from "handlebars";
import { PrintData } from "./types";
import mockData from "../mocks/finance-with-trade.json" with { type: "json" };

// DO NOT USE MJML TEMPLATES - USE PRECOMPILED HTML TEMPLATES - BROWSER CANNOT PROCESS MJML
import htmlTemplate from "./templates/html/print.html.hbs";

// export class PrintComponent extends LitElement {
//   constructor() {
//     super();
//   }

  // render() {
  //   return html`${renderPrint(mockData.data)}`;
  // }
// }

// customElements.define("print-component", PrintComponent);
// renderPrint(mockData.data);

export function renderPrint(data?: PrintData): string {
  const out = Handlebars.compile(htmlTemplate)(data ?? mockData.data);
  console.log(out);
  return out;
}