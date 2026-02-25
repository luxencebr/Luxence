import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { profileId, appearance } = await req.json();

    if (!profileId || !Array.isArray(appearance)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    await prisma.producerAppearance.deleteMany({
      where: { profileId },
    });

    const dataToCreate = appearance.map((a: any) => {
      let valueNumber = typeof a.valueNumber === "number" ? a.valueNumber : null;
      
      // Validação especial para dote (appearanceId 15)
      if (a.appearanceId === 15 && valueNumber !== null) {
        // Desconsiderar valor zero ou fora do range 0-99
        if (valueNumber <= 0 || valueNumber > 99) {
          valueNumber = null;
        }
      }

      return {
        profileId,
        appearanceId: a.appearanceId,
        valueBoolean: a.valueBoolean ?? null,
        valueNumber,
        valueString: typeof a.valueString === "string" ? a.valueString : null,
      };
    });

    if (dataToCreate.length > 0) {
      await prisma.producerAppearance.createMany({
        data: dataToCreate,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar aparência:", error);

    return NextResponse.json(
      { error: "Erro interno ao salvar aparência" },
      { status: 500 }
    );
  }
}
