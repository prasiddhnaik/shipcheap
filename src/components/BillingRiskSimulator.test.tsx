import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { defaultSimulatorInput } from "@/lib/billing-risk-simulation";
import { BillingRiskSimulator } from "./BillingRiskSimulator";

test("the visible simulator replaces prices with eligibility guidance for a blocked provider", () => {
  const html = renderToStaticMarkup(
    <BillingRiskSimulator
      initialInput={{ ...defaultSimulatorInput, providerSlug: "fly", hasCard: false }}
    />,
  );

  assert.match(html, /Unavailable without a card/);
  assert.match(html, /P90 simulated bill/);
  assert.match(html, /Card required/);
  assert.match(html, /Monthly bill unavailable for this setup/);
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-pressed="false"/);
});
