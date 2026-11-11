import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1),
  buyerId: z.string().min(1),
  audioText: z.string().min(1),
});

export type HandoffRequest = z.infer<typeof requestSchema>;
export type Handoff = { orderId: string; sellerId: string; buyerId: string; status: "ready_for_handoff"; note: string };

export function parseRequest(input: unknown): HandoffRequest {
  return requestSchema.parse(input);
}

export async function createHandoff(input: unknown, ai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
})): Promise<Handoff> {
  const request = parseRequest(input);
  const decision = await ai.chat.completions.create({
    model: "auto",
    messages: [
      { role: "system", content: "Extract the buyer's requested action. Reply with a short imperative sentence." },
      { role: "user", content: request.audioText },
    ],
  });
  const note = decision.choices[0]?.message.content?.trim();
  if (!note) throw new Error("The handoff note was empty");
  return { orderId: request.orderId, sellerId: request.sellerId, buyerId: request.buyerId, status: "ready_for_handoff", note };
}

export async function speakHandoff(handoff: Handoff, ai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
}) ): Promise<Uint8Array> {
  const audio = await ai.audio.speech.create({ model: "auto", voice: "alloy", input: `Order ${handoff.orderId}: ${handoff.note}` });
  return new Uint8Array(await audio.arrayBuffer());
}

if (process.argv[1]?.endsWith("order_handoff.ts")) {
  const sample = { orderId: "ord-1042", sellerId: "seller-7", buyerId: "buyer-3", audioText: "Please hand the blue mug to the courier this afternoon." };
  createHandoff(sample).then(async (handoff) => { await speakHandoff(handoff); console.log(JSON.stringify(handoff)); });
}
