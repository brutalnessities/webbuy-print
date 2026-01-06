// DO NOT USE MJML TEMPLATES IN THE BROWSER
import Handlebars from "handlebars";
import htmlTemplate from "./templates/html/print.html.hbs";

export function renderHtml(data: any): string {
  return Handlebars.compile(htmlTemplate)(data);
}
