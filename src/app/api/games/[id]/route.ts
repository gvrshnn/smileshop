import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = parseInt(params.id);
    const body = await request.json();

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        platform: body.platform,
        imageUrl: body.imageUrl,
        keys: body.keys,
      },
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении игры" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = parseInt(params.id);

    // Сначала удаляем все заказы, связанные с этой игрой
    await prisma.order.deleteMany({
      where: { gameId },
    });

    // Затем удаляем саму игру
    await prisma.game.delete({
      where: { id: gameId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении игры" },
      { status: 500 }
    );
  }
}
