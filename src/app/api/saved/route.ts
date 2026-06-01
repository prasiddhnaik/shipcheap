import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CalculatorInput, RankedPlatform } from "@/lib/types";

type SaveRequest = {
  input?: CalculatorInput;
  results?: RankedPlatform[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as SaveRequest;

  if (!body.input || !body.results || !Array.isArray(body.results)) {
    return NextResponse.json({ error: "Invalid saved comparison payload." }, { status: 400 });
  }

  const saved = await prisma.savedComparison.create({
    data: {
      appType: body.input.appType,
      budget: body.input.budget,
      database: body.input.database,
      alwaysOn: body.input.alwaysOn,
      hasCard: body.input.hasCard,
      region: body.input.region,
      riskLevel: body.input.riskLevel,
      resultJson: body.results,
    },
  });

  return NextResponse.json({ id: saved.id });
}
