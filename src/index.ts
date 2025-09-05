import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { PrintData } from "./types";
import clipboard from "clipboardy";
import mockData from "../mocks/finance-with-trade.json";
import { html, LitElement } from "lit-element";
// import leadData from "../mocks/leadsResponse.json";
// import { dataFromLead } from "../helpers/parseLead";

// Read the MJML/Handlebars template
const templatePath = path.join(__dirname, "templates", "print.hbs");
const templateSource = fs.readFileSync(templatePath, "utf-8");

// Compile Handlebars
const printTemplate = Handlebars.compile(templateSource);

// Render function
export function renderPrint(data: PrintData): string {
  // Preprocess items for subtotal
  // const data = dataFromLead(leadData.data.lead.data);

  // Step 1: Inject data into MJML template
  const mjmlWithData = printTemplate(data);

  // Step 2: Compile MJML to HTML
  const { html, errors } = mjml2html(mjmlWithData, { minify: true });

  if (errors && errors.length > 0) {
    console.warn("MJML compilation errors:", errors);
  }

  // testing: save the file to check the render
  fs.writeFileSync("./dist/test.html", html);

  // TODO: remove clipboardy
  clipboard.writeSync(html);
  return html;
}

export class PrintComponent extends LitElement {
  constructor() {
    super();
  }

  render() {
    return html`${renderPrint(mockData.data)}`;
  }
}

customElements.define("print-component", PrintComponent);
// renderPrint(mockData.data);
