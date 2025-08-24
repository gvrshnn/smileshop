import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const games = await prisma.game.findMany();
  return NextResponse.json(games);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newGame = await prisma.game.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        platform: body.platform,
        imageUrl: body.imageUrl,
        keys: body.keys || [],
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Ошибка при создании игры" },
      { status: 500 }
    );
  }
}
