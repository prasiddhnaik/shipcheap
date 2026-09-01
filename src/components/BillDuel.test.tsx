import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BillDuel } from "./BillDuel";
import { defaultSimulatorInput } from "@/lib/billing-risk-simulation";

test("Bill Duel does not compare one eligible provider against itself", () => {
  const html = renderToStaticMarkup(
    <BillDuel input={{ ...defaultSimulatorInput, providerSlug: "fly", hasCard: false }} />,
  );

  assert.doesNotMatch(html, /stays cheapest/);
  assert.match(html, /Card required/);
  assert.match(html, /Unavailable/);
});

test("Bill Duel keeps the comparison summary when multiple providers are eligible", () => {
  const html = renderToStaticMarkup(
    <BillDuel input={{ ...defaultSimulatorInput, providerSlug: "render", hasCard: true }} />,
  );

  assert.match(html, /stays cheapest/);
  assert.match(html, /First to blow/);
});

test("Bill Duel reports a complete tie without naming one provider as both extremes", () => {
  const html = renderToStaticMarkup(
    <BillDuel
      input={{ ...defaultSimulatorInput, providerSlug: "render", hasCard: false }}
      initialChallengerSlugs={["koyeb", "vercel"]}
    />,
  );

  assert.match(html, /tied under this scenario/i);
  assert.doesNotMatch(html, /stays cheapest/);
  assert.doesNotMatch(html, /First to blow/);
});
