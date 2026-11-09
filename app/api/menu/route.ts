import { NextResponse } from "next/server";
import { menu } from "@/data/menu";

export async function GET() {
  return NextResponse.json(menu);
}
