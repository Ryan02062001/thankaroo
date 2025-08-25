"use server";

import { createClient } from "@/utils/supabase/server";
import { getAiDraftsThisMonth, getCurrentPlanForUserFast, incrementAiDraftsThisMonth } from "@/lib/plans";
import { openai } from "@/lib/openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

type Channel = "email" | "text" | "card";
type Relationship = "friend" | "family" | "coworker" | "other";
type Tone = "warm" | "formal" | "playful";

export async function generateThankYouDraft(input: {
	channel: Channel;
	relationship: Relationship;
	tone: Tone;
	occasion?: string;
	personalTouch?: string;
	gift: { guestName: string; description: string };
}) {
	try {
		const supabase = await createClient();
		const { data: auth } = await supabase.auth.getUser();
		if (!auth.user) return "";

		// Parallelize plan + usage checks, and avoid Stripe fallback
		const [{ limits }, used] = await Promise.all([
			getCurrentPlanForUserFast(),
			getAiDraftsThisMonth(),
		]);

		if (typeof limits.maxAiDraftsPerMonth === "number" && used >= limits.maxAiDraftsPerMonth) {
			return "";
		}

		const { channel, relationship, tone, occasion, personalTouch, gift } = input;

		const channelGuidance =
			channel === "text"
				? "Output must be a concise SMS (no greeting lines, single paragraph, 2–4 sentences, no signature)."
				: channel === "card"
				? "Output should read like a short handwritten note (friendly, 3–6 short lines). Include a greeting and a sign-off."
				: "Output should read like a short email (greeting, 1–2 short paragraphs, sign-off).";

		const relationshipHint =
			relationship === "family"
				? "Write with warm familiarity, a touch more personal."
				: relationship === "coworker"
				? "Keep it professional but warm."
				: relationship === "friend"
				? "Casual, warm, friendly tone."
				: "Neutral tone.";

		const toneHint =
			tone === "formal"
				? "Keep it polite and formal."
				: tone === "playful"
				? "Light, upbeat, and friendly."
				: "Warm and sincere.";

		const occasionText = occasion && occasion !== "general" ? `This was for a ${occasion}.` : "";
		const personalPS =
			personalTouch && personalTouch.trim()
				? `Briefly include this personal detail: ${personalTouch.trim()}`
				: "";

		const system = `
You write concise, heartfelt thank-you notes that feel specific and personal.
Guidelines:
- Mention the gift specifically: "${gift.description}" from ${gift.guestName}.
- ${channelGuidance}
- ${relationshipHint}
- ${toneHint}
- ${occasionText}
- ${personalPS}
- Vary the wording; avoid repeating the same phrasing.
- No apologies, disclaimers, or meta commentary.
- Keep it natural and ready to send.
`.trim();

		const greetingNeeded = channel !== "text";
		const signoffNeeded = channel !== "text";

		const messages = [
			{ role: "system", content: system as string },
			{
				role: "user",
				content: [
					greetingNeeded ? `Recipient: ${gift.guestName}` : "",
					`Gift: ${gift.description}`,
					`Channel: ${channel}`,
					`Relationship: ${relationship}`,
					`Tone: ${tone}`,
					greetingNeeded ? "Include a greeting." : "No greeting line.",
					signoffNeeded ? "Include a short sign-off." : "No signature.",
				]
					.filter(Boolean)
					.join("\n"),
			},
		];

		const completion = await openai.chat.completions.create({
			model: "gpt-5-nano",
			messages: messages as ChatCompletionMessageParam[],
		});

		let text: string = completion.choices?.[0]?.message?.content?.toString().trim() ?? "";

		// SMS: one paragraph
		if (channel === "text") {
			text = text.replace(/\s*\n+\s*/g, " ").replace(/\s{2,}/g, " ").trim();
		}

		if (text) {
			await incrementAiDraftsThisMonth(1);
		}

		return text;
	} catch (error) {
		console.error("AI generation error:", error);
		return "";
	}
}