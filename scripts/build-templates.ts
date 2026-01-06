// precompiles MJML since browser cannot handle MJML templates
import fs from "fs";
// import { minify } from "html-minifier-terser";
import mjml2html from "mjml";

const input = "src/templates/mjml/print.mjml.hbs";
const output = "src/templates/html/print.html.hbs";

const mjml = fs.readFileSync(input, "utf8");

const { html, errors } = mjml2html(mjml);
// const minifiedHtml = await minify(html, {
//   collapseWhitespace: true,
//   removeComments: true,
//   minifyCSS: true,
//   minifyJS: true,
// });

if (errors.length) {
  console.error(errors);
  process.exit(1);
}

fs.writeFileSync(output, html);
