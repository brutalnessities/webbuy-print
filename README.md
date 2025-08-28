This package is designed to reduce drift across the client, admin, and email prints. It uses MJML at the base to support email oriented HTML and Handlebars implements interpolation and various operational helpers for dynamic layouts.

MJML useful links:
 - live editor = https://mjml.io/try-it-live/
 - documentation = https://documentation.mjml.io/

Handlebars links:
 - documentation = https://handlebarsjs.com/guide/builtin-helpers.html

[wip] In order for this to work, we:
1. start with .hbs file and write, essentially, MJML code.
2. compile .hbs to .mjml
3. compile .mjml to .html
4. return

reading through, we should be able to export this as custom element for angular and also be able to run it via nodejs
