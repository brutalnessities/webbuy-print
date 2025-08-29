This package is designed to reduce drift across the client, admin, and email prints. It uses MJML at the base to support email oriented HTML and Handlebars implements interpolation and various operational helpers for dynamic layouts.

MJML useful links:
 - live editor = https://mjml.io/try-it-live/
 - documentation = https://documentation.mjml.io/
 - 'ending tags' will not generate styles that comform to email-html. https://documentation.mjml.io/#ending-tags

eg. instead of doing:
  <mj-table>
    <tr>
      <td style="padding: 0 12px 0 0;">1995</td>
      <td align="right">JavaScript</td>
    </tr>
  </mj-table>

prefer:
<mj-section>
  <mj-column>
    <mj-text mj-class="pl-2">Title</mj-text>
  </mj-column>
  <mj-column>
    <mj-text align="right">Title</mj-text>
  </mj-column>
</mj-section>


Handlebars links:
 - documentation = https://handlebarsjs.com/guide/builtin-helpers.html

test email compatibility: https://testi.at/firstproj

[wip] In order for this to work, we:
 1. start with .hbs file and write, essentially, MJML code.
 2. compile .hbs to .mjml
 3. compile .mjml to .html
 4. return

reading through, we should be able to export this as custom element for angular and also be able to run it via nodejs
