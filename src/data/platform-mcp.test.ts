import assert from "node:assert/strict";
import test from "node:test";
import {
  getPlatformMcpIntegration,
  getPlatformSourceLinks,
  platformMcpIntegrations,
} from "./platforms";

test("official remote MCP providers expose source-backed agent capabilities", () => {
  const render = getPlatformMcpIntegration("render");

  assert.equal(render?.kind, "official-remote");
  assert.match(render?.endpoint ?? "", /^https:\/\//);
  assert.ok(render?.capabilities.includes("deploy services"));
  assert.ok(getPlatformSourceLinks("render").some((source) => source.url === render?.docsUrl));
});

test("local provider control and MCP workload hosting are not mislabeled as remote MCP", () => {
  assert.equal(getPlatformMcpIntegration("fly")?.kind, "official-local");
  assert.equal(getPlatformMcpIntegration("koyeb")?.kind, "official-local");
  assert.equal(getPlatformMcpIntegration("koyeb")?.canHostMcpServer, true);
  assert.equal(getPlatformMcpIntegration("koyeb")?.endpoint, undefined);
});

test("every MCP capability is explicit and linked to an HTTPS source", () => {
  const allowedKinds = new Set(["official-remote", "official-local", "hosts-mcp"]);

  for (const [slug, integration] of Object.entries(platformMcpIntegrations)) {
    assert.ok(allowedKinds.has(integration.kind), `${slug} has an unknown MCP kind`);
    assert.match(integration.docsUrl, /^https:\/\//);
    assert.ok(integration.capabilities.length > 0);
    assert.ok(getPlatformSourceLinks(slug).some((source) => source.url === integration.docsUrl));
  }
});
