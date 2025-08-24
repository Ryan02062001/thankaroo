"use server";

import { createClient } from "@/utils/supabase/server";
import { getAiDraftsThisMonth, getCurrentPlanForUser, incrementAiDraftsThisMonth } from "@/lib/plans";

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

		const { limits } = await getCurrentPlanForUser();
		if (typeof limits.maxAiDraftsPerMonth === "number") {
			const used = await getAiDraftsThisMonth();
			if (used >= limits.maxAiDraftsPerMonth) {
				return "";
			}
		}

		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			console.log("OPENAI_API_KEY is missing");
			return "";
		}

		const model = process.env.OPENAI_CHAT_MODEL || "gpt-5-nano";
		const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
		const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 8000);

		console.log("API key found, length:", apiKey.length);
		console.log("API key starts with:", apiKey.substring(0, 10));

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
		const maxTokens = channel === "text" ? 100 : channel === "card" ? 160 : 220;

        const body = {
			model,
			messages: [
				{ role: "system", content: system },
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
			],
			temperature: 0.7,
			max_tokens: maxTokens,
		};

		console.log("Calling OpenAI Chat Completions API with model:", model);

		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		let resp = await fetch(`${apiBase}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
			cache: "no-store",
			signal: controller.signal,
		});
		clearTimeout(timer);

		if (!resp.ok) {
			let payload: unknown = null;
			try { payload = await resp.json(); } catch {}
			const errText = (payload as unknown) || (await resp.text().catch(() => ""));
			console.error("OpenAI API error:", { status: resp.status, statusText: resp.statusText, body: errText });
			const p = (payload as { error?: { code?: string; type?: string } } | null) || null;
			const code = p?.error?.code || p?.error?.type || "";
			const fallbackModel = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini";
			if ((resp.status === 404 || String(code).includes("model")) && model !== fallbackModel) {
				console.warn("Retrying with fallback model:", fallbackModel);
				const c2 = new AbortController();
				const t2 = setTimeout(() => c2.abort(), timeoutMs);
				resp = await fetch(`${apiBase}/chat/completions`, {
					method: "POST",
					headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
					body: JSON.stringify({ ...body, model: fallbackModel }),
					cache: "no-store",
					signal: c2.signal,
				});
				clearTimeout(t2);
				if (!resp.ok) {
					return "";
				}
			} else {
				return "";
			}
		}

		const data = await resp.json();
		console.log("GPT response received:", !!data?.choices?.[0]?.message?.content);

		let text: string = data?.choices?.[0]?.message?.content?.toString().trim() ?? "";

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