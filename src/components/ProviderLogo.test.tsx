import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ProviderLogo } from "./ProviderLogo";

test("recommendation logos use a contained 56px frame and complete provider marks", () => {
  const html = renderToStaticMarkup(
    <div>
      <ProviderLogo name="Koyeb" size="recommendation" />
      <ProviderLogo name="Google Cloud Run" size="recommendation" />
      <ProviderLogo name="Northflank" size="recommendation" />
    </div>,
  );

  assert.match(html, /h-14 w-14/);
  assert.match(html, /aria-label="Koyeb logo"/);
  assert.match(html, /aria-label="Google Cloud Run logo"/);
  assert.match(html, /src="\/provider-logos\/northflank\.svg"/);
  assert.match(html, /object-contain/);
  assert.doesNotMatch(html, /Northflank logo fallback/);
});

test("an unknown provider renders an accessible text mark instead of an image", () => {
  const html = renderToStaticMarkup(<ProviderLogo name="Example Hosting" size="recommendation" />);

  assert.match(html, /aria-label="Example Hosting logo fallback"/);
  assert.match(html, />EX</);
  assert.doesNotMatch(html, /<img/);
});
