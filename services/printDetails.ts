import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import mockData from "../mocks/finance-with-trade.json";

// Read the MJML/Handlebars template
const templatePath = path.join(__dirname, "templates", "print.mjml.hbs");
const templateSource = fs.readFileSync(templatePath, "utf-8");

// Compile Handlebars
const printTemplate = Handlebars.compile(templateSource);

// Render function
export function compile(data: any): string {
  // Preprocess items for subtotal

  // Step 1: Inject data into MJML template
  const mjmlWithData = printTemplate({ ...data });

  // Step 2: Compile MJML to HTML
  const { html, errors } = mjml2html(mjmlWithData, { minify: true });

  if (errors && errors.length > 0) {
    console.warn("MJML compilation errors:", errors);
  }

  // testing: save the file to check the render
  fs.writeFileSync(path.join(__dirname, "test.html"), html);

  return html;
}

//test
compile(mockData.data);
