import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await prisma.linkedProject.deleteMany({ where: { id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
