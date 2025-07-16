import { NextRequest, NextResponse } from "next/server";
import { useTranslatorService } from "@/services/transaltor/useTranslatorService";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const document = formData.get("document") as File | null;
  const glossary = formData.get("glossary") as File | null;
  const targetLanguage = formData.get("targetLanguage") as string;
  const sourceLanguage = formData.get("sourceLanguage") as string | undefined;

  if (!document || !targetLanguage) {
    return NextResponse.json({ error: "File o lingua mancante" }, { status: 400 });
  }

  const newFormData = new FormData();
  newFormData.append("document", document);
  if (glossary) newFormData.append("glossary", glossary);

  try {
    const blob = await useTranslatorService().actions.translateDocument(newFormData, targetLanguage, sourceLanguage);
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename=translated.docx`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}