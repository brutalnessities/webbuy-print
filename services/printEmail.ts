import fs from "fs";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { EmailPrintData } from "../src/types";
import mockData from "../mocks/finance-with-trade.json";

export function compile(data: EmailPrintData) {
  // Load partials
  const header = fs.readFileSync("./templates/partials/header.hbs", "utf8");
  const body = fs.readFileSync("./templates/partials/print.hbs", "utf8");
  const footer = fs.readFileSync("./templates/partials/footer.hbs", "utf8");

  // Render parts
  const renderedHeader = Handlebars.compile(header)(data);
  const renderedBody = Handlebars.compile(body)(data);
  const renderedFooter = Handlebars.compile(footer)(data);

  // Load main template
  const emailMjml = fs.readFileSync("./templates/email.mjml", "utf8");
  const emailTemplate = Handlebars.compile(emailMjml);

  // Merge everything
  const mjmlWithPartials = emailTemplate({
    ...data,
    header: renderedHeader,
    body: renderedBody,
    footer: renderedFooter,
  });

  // Convert MJML → HTML
  const { html } = mjml2html(mjmlWithPartials, { validationLevel: "soft" });
  return html;
}

//test
compile(mockData);
