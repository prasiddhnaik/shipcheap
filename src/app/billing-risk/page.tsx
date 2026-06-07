import type { Metadata } from "next";
import { AppChrome } from "@/components/AppChrome";
import { BillingRiskSimulator } from "@/components/BillingRiskSimulator";

export const metadata: Metadata = {
  title: "Billing Risk Simulator | ShipCheap",
  description: "Model accidental hosting bill risk before choosing a deployment platform.",
};

export default function BillingRiskPage() {
  return (
    <AppChrome active="billing-risk" compactSidebar>
      <BillingRiskSimulator />
    </AppChrome>
  );
}
