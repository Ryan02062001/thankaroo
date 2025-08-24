"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Sparkles,
	Heart,
	RefreshCcw,
	Users,
	Gift,
	CheckCircle2,
	Mail,
	MessageSquare,
	Scroll,
	Filter,
	Copy,
	Check,
	Search,
	Settings2,
	ChevronDown,
} from "lucide-react";
import { useReminders, type Channel, type Relationship, type Tone } from "@/app/contexts/ReminderContext";
import { generateDraft } from "@/lib/draft-templates";
import { generateThankYouDraft } from "@/app/actions/ai";
import { saveThankYouDraftAction, sendThankYouNoteAction } from "@/app/actions/thankyous";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuotaBanner, useBillingSummary } from "@/components/QuotaBanner";

export type UIGift = {
	id: string;
	guestName: string;
	description: string;
	type: "non registry" | "monetary" | "registry" | "multiple";
	date: string; // YYYY-MM-DD
	thankYouSent: boolean;
};

type StatusFilter = "all" | "pending" | "sent";

type Note = {
	id: string;
	gift_id: string;
	channel: Channel;
	relationship: Relationship;
	tone: Tone;
	status: "draft" | "sent";
	content: string;
	meta: { occasion?: string | null; personalTouch?: string | null } | null;
	created_at: string;
	updated_at: string;
	sent_at: string | null;
};

export default function ThankYousClient({
	listId,
	gifts,
	notes,
}: {
	listId: string;
	gifts: UIGift[];
	notes: Note[];
}) {
	const router = useRouter();
	const { getDraftsForGift } = useReminders();
	const { data: billing } = useBillingSummary();

	// Overall counts
	const counts = React.useMemo(() => {
		const total = gifts.length;
		const sent = gifts.filter((g) => g.thankYouSent).length;
		const pending = total - sent;
		const pct = total ? Math.round((sent / total) * 100) : 0;
		return { total, sent, pending, pct };
	}, [gifts]);

	// Filters & search
	const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("pending");
	const [query, setQuery] = React.useState("");

	// Build people list from search only, so it's never empty due to status filter
	const queryFilteredGifts = React.useMemo(() => {
		if (!query.trim()) return gifts;
		const q = query.trim().toLowerCase();
		return gifts.filter((g) => (g.guestName || "unknown").toLowerCase().includes(q));
	}, [gifts, query]);

	const applyStatusFilter = React.useCallback(
		(list: UIGift[]) => {
			if (statusFilter === "pending") return list.filter((g) => !g.thankYouSent);
			if (statusFilter === "sent") return list.filter((g) => g.thankYouSent);
			return list;
		},
		[statusFilter]
	);

	// Build person → gifts map using queryFilteredGifts
	const people = React.useMemo(() => {
		const map = new Map<string, UIGift[]>();
		queryFilteredGifts.forEach((g) => {
			const key = (g.guestName || "Unknown").trim();
			map.set(key, [...(map.get(key) ?? []), g]);
		});
		return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
	}, [queryFilteredGifts]);

	const personList = React.useMemo(() => [...people.keys()], [people]);

	// Per-person summary (all gifts per person)
	const personSummary = React.useMemo(() => {
		const m = new Map<string, { total: number; sent: number; pending: number }>();
		people.forEach((list, name) => {
			const total = list.length;
			const sent = list.filter((g) => g.thankYouSent).length;
			m.set(name, { total, sent, pending: total - sent });
		});
		return m;
	}, [people]);

	// Current selection
	const [selectedPerson, setSelectedPerson] = React.useState<string | null>(personList[0] ?? null);
	React.useEffect(() => {
		if (!selectedPerson && personList.length > 0) setSelectedPerson(personList[0]);
		if (selectedPerson && !people.has(selectedPerson) && personList.length > 0) {
			setSelectedPerson(personList[0]);
		}
	}, [personList, people, selectedPerson]);

	const personGifts = React.useMemo(
		() => (selectedPerson ? people.get(selectedPerson) ?? [] : []),
		[people, selectedPerson]
	);
	const personGiftsFiltered = React.useMemo(() => applyStatusFilter(personGifts), [applyStatusFilter, personGifts]);

	const [selectedGiftId, setSelectedGiftId] = React.useState<string | null>(
		personGiftsFiltered[0]?.id ?? null
	);
	React.useEffect(() => {
		const first = personGiftsFiltered[0]?.id ?? null;
		setSelectedGiftId((prev) => (personGiftsFiltered.some((g) => g.id === prev) ? prev : first));
	}, [personGiftsFiltered]);

	const selectedGift = React.useMemo(
		() => personGiftsFiltered.find((g) => g.id === selectedGiftId) ?? null,
		[personGiftsFiltered, selectedGiftId]
	);

	// Composer meta
	const [channel, setChannel] = React.useState<Channel>("email");
	const [relationship, setRelationship] = React.useState<Relationship>("friend");
	const [tone, setTone] = React.useState<Tone>("warm");
	const [occasion, setOccasion] = React.useState<string>("wedding");
	const [personalTouch, setPersonalTouch] = React.useState<string>("");
	const [content, setContent] = React.useState("");
	const [isGenerating, setIsGenerating] = React.useState(false);

	// Advanced toggle
	const [showAdvanced, setShowAdvanced] = React.useState(false);

	// Copy feedback
	const [copied, setCopied] = React.useState(false);
	// Save feedback
	const [saved, setSaved] = React.useState(false);

	// Persisted notes lookup
	const notesByGift = React.useMemo(() => {
		const m = new Map<string, Note[]>();
		for (const n of notes) {
			const arr = m.get(n.gift_id) ?? [];
			arr.push(n);
			m.set(n.gift_id, arr);
		}
		return m;
	}, [notes]);

	const currentPersistedNote = React.useMemo(
		() => (selectedGift ? (notesByGift.get(selectedGift.id) ?? []).find((n) => n.channel === channel) ?? null : null),
		[selectedGift, channel, notesByGift]
	);

	// Load existing persisted note or local draft for selected gift/channel (no auto-generate)
	React.useEffect(() => {
		if (!selectedGift) {
			setContent("");
			return;
		}
		const persisted = currentPersistedNote;
		if (persisted) {
			setContent(persisted.content);
			setRelationship(persisted.relationship);
			setTone(persisted.tone);
			setOccasion(persisted.meta?.occasion || "wedding");
			setPersonalTouch(persisted.meta?.personalTouch || "");
		} else {
			const drafts = getDraftsForGift(selectedGift.id);
			const current = drafts.find((d) => d.channel === channel);
			if (current) {
				setContent(current.content);
				setRelationship(current.relationship);
				setTone(current.tone);
			} else {
				setContent("");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGift, channel, currentPersistedNote]);

	const saveDraft = async () => {
		if (!selectedGift) return;
		const form = new FormData();
		form.set("note_id", currentPersistedNote?.id ?? "");
		form.set("list_id", listId);
		form.set("gift_id", selectedGift.id);
		form.set("channel", channel);
		form.set("relationship", relationship);
		form.set("tone", tone);
		form.set("content", content);
		form.set("occasion", occasion);
		form.set("personal_touch", personalTouch);
		await saveThankYouDraftAction(form);
		setSaved(true);
		setTimeout(() => setSaved(false), 1500);
	};

	const generateNote = async () => {
		if (!selectedGift) return;
		setIsGenerating(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 250));

			const aiDraft = await generateThankYouDraft({
				channel,
				relationship,
				tone,
				occasion,
				personalTouch,
				gift: {
					guestName: selectedGift.guestName,
					description: selectedGift.description,
				},
			});

			if (aiDraft && aiDraft.trim()) {
				setContent(aiDraft);
			} else {
				const fallback = generateDraft({
					channel,
					gift: {
						guestName: selectedGift.guestName,
						description: selectedGift.description,
					},
					relationship,
					tone,
				});
				setContent(appendMeta(fallback, personalTouch, occasion));
			}
		} catch {
			const fallback = generateDraft({
				channel,
				gift: {
					guestName: selectedGift.guestName,
					description: selectedGift.description,
				},
				relationship,
				tone,
			});
			setContent(appendMeta(fallback, personalTouch, occasion));
		} finally {
			setIsGenerating(false);
		}
	};

	const copyToClipboard = async () => {
		if (!content) return;
		try {
			await navigator.clipboard.writeText(content);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// noop
		}
	};

	// Channel icon (used in toolbar)
	const getChannelIcon = (ch: Channel) => (ch === "email" ? Mail : ch === "text" ? MessageSquare : Scroll);

	// Quick share helpers
	const buildMailtoUrl = (subject: string, body: string) =>
		`mailto:?subject=${encodeURIComponent(subject || "Thank you!")}&body=${encodeURIComponent(body || "")}`;

	const buildSmsUrl = (body: string) => `sms:&body=${encodeURIComponent(body || "")}`;

	const escapeHtml = (s: string) =>
		s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

	const printNote = (text: string) => {
		const w = window.open("", "_blank");
		if (!w) return;
		const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Thank You Note</title>
<style>
body{background:#fff;font-family:ui-serif,Georgia,serif;color:#2d2d2d;line-height:1.7;margin:0;padding:40px}
.sheet{max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,.06)}
pre{white-space:pre-wrap;word-break:break-word}
</style></head><body><div class="sheet"><pre>${escapeHtml(text)}</pre></div></body></html>`;
		w.document.open();
		w.document.write(html);
		w.document.close();
		w.focus();
		w.print();
	};

	// Simple confetti without deps
	const fireConfetti = () => {
		if (typeof window === "undefined") return;
		const count = 24;
		for (let i = 0; i < count; i++) {
			const s = document.createElement("span");
			s.textContent = Math.random() > 0.5 ? "🎉" : "✨";
			s.style.position = "fixed";
			s.style.left = `${window.innerWidth / 2}px`;
			s.style.top = `${window.innerHeight / 2}px`;
			s.style.fontSize = `${12 + Math.random() * 14}px`;
			s.style.pointerEvents = "none";
			s.style.zIndex = "9999";
			document.body.appendChild(s);
			const dx = (Math.random() - 0.5) * window.innerWidth;
			const dy = (Math.random() - 0.1) * window.innerHeight;
			s.animate(
				[
					{ transform: "translate(0,0) rotate(0deg)", opacity: 1 },
					{ transform: `translate(${dx}px, ${dy}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
				],
				{ duration: 1200 + Math.random() * 600, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
			).finished.finally(() => s.remove());
		}
	};

	// Helpers
	const giftChipLabel = (g: UIGift) => {
		const date = new Date(g.date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
		const desc = (g.description || "No description").trim();
		const short = desc.length > 28 ? desc.slice(0, 28) + "…" : desc;
		return `${short} • ${date}`;
	};

	const avatarFor = (name: string) => {
		const initial = (name?.[0] ?? "?").toUpperCase();
		return (
			<div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] font-semibold shadow-sm ring-1 ring-black/5">
				{initial}
			</div>
		);
	};

	if (personList.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<div className="text-center max-w-md">
					<div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#A8E6CF]/20 to-[#A8E6CF]/40 rounded-full flex items-center justify-center mb-6">
						<Gift className="h-8 w-8 text-[#A8E6CF]" />
					</div>
					<h3 className="text-xl font-semibold text-[#2d2d2d] mb-2">No matches</h3>
					<p className="text-gray-600 mb-4">Try clearing filters or search.</p>
					<div className="flex items-center justify-center gap-2">
						<Button variant="outline" onClick={() => { setQuery(""); setStatusFilter("all"); }}>
							Clear filters
						</Button>
						<Link href="/giftlist">
							<Button className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]">Go to Gift List</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 overflow-hidden">
			{/* Quick overview bar */}
			<div className="flex items-center justify-between text-sm text-[#2d2d2d] mb-2">
				<div className="font-semibold">Progress</div>
				<div className="text-gray-600">{counts.sent}/{counts.total} sent • {counts.pending} pending</div>
			</div>
			<div className="text-xs sm:text-sm text-gray-600">Focusing on pending helps you finish faster.</div>

			{/* Main */}
			<div className="grid gap-6 xl:grid-cols-[360px_1fr]">
				{/* People + Filters */}
				<div className="space-y-6">
					<Card className="bg-white/80 border border-gray-200/60 shadow-sm backdrop-blur">
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-lg text-[#2d2d2d]">
								<Users className="h-5 w-5 text-[#A8E6CF]" />
								<span>People</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Filters */}
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Filter className="h-4 w-4" />
									<span>Filter</span>
								</div>
								<Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
									<TabsList>
										<TabsTrigger value="all">All ({counts.total})</TabsTrigger>
										<TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
										<TabsTrigger value="sent">Sent ({counts.sent})</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>

							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									className="pl-9"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search people…"
								/>
							</div>

							{/* Person dropdown (mobile) */}
							<div className="lg:hidden">
								<label className="text-sm font-medium text-[#2d2d2d] mb-2 block">From whom?</label>
								<Select value={selectedPerson ?? undefined} onValueChange={(v) => setSelectedPerson(v)}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Choose a person..." />
									</SelectTrigger>
									<SelectContent>
										{personList.map((p) => (
											<SelectItem key={p} value={p}>
												{p}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* People list (desktop) */}
							<div className="hidden lg:block">
								<ul className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
									{personList.map((p) => {
										const s = personSummary.get(p)!;
										const active = p === selectedPerson;
										const pct = s.total ? Math.round((s.sent / s.total) * 100) : 0;
										return (
											<li key={p}>
												<button
													type="button"
													onClick={() => setSelectedPerson(p)}
													className={`w-full text-left rounded-xl border p-3 transition-all ${
														active
															? "border-[#A8E6CF] bg-[#A8E6CF]/10 shadow-sm"
															: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
													}`}
												>
													<div className="flex items-center gap-3">
														{avatarFor(p)}
														<div className="min-w-0 flex-1">
															<div className="flex items-center justify-between gap-2">
																<div className="font-medium text-[#2d2d2d] truncate">{p}</div>
																<div className="text-xs text-gray-600 whitespace-nowrap">{s.sent}/{s.total} sent</div>
															</div>
															<div className="mt-2">
																<div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
																	<div className="h-full bg-gradient-to-r from-[#A8E6CF] to-[#98CFBA]" style={{ width: `${pct}%` }} />
																</div>
															</div>
														</div>
													</div>
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Composer + Preview (with integrated settings toolbar) */}
				<Card className="bg-white/80 border border-gray-200/60 shadow-sm backdrop-blur lg:sticky lg:top-28 h-fit">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg text-[#2d2d2d]">
							<Heart className="h-5 w-5 text-[#A8E6CF]" />
							<span>Your Thank You Note</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{billing ? <QuotaBanner context="ai" /> : null}
						{!selectedGift ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
									<Sparkles className="h-8 w-8 text-gray-400" />
								</div>
								<h3 className="text-lg font-semibold text-[#2d2d2d] mb-2">Select a gift to get started</h3>
								<p className="text-gray-600 max-w-sm">
									Choose a person on the left and we&apos;ll help you write a beautiful note.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{/* Gift context */}
								<div className="rounded-xl bg-gray-50/60 border border-gray-200/60 p-4">
									<div className="flex items-start gap-3">
										<div className="p-2 bg-[#A8E6CF]/20 rounded-lg">
											<Gift className="h-4 w-4 text-[#A8E6CF]" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-[#2d2d2d] mb-1 break-words break-all">
												{selectedGift.description || "No description"}
											</div>
											<div className="text-sm text-gray-600 break-words break-all">
												Received on{" "}
												{new Date(selectedGift.date).toLocaleDateString("en-US", {
													weekday: "long",
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</div>
											{selectedGift.thankYouSent && (
												<Badge className="mt-2 bg-[#A8E6CF]/20 text-[#2d2d2d]">
													<CheckCircle2 className="mr-1 h-3 w-3" />
													Thank you sent
												</Badge>
											)}
										</div>
									</div>
								</div>

								{/* Gift selection for person */}
								{personGiftsFiltered.length > 1 && (
									<div>
										<div className="text-sm font-medium text-[#2d2d2d] mb-2">Which gift?</div>
										<div className="flex gap-2 flex-wrap">
											{personGiftsFiltered.map((g) => {
												const active = g.id === selectedGiftId;
												return (
													<button
														key={g.id}
														type="button"
														onClick={() => setSelectedGiftId(g.id)}
														className={`relative rounded-full border px-3 py-2 text-sm transition-all ${
															active
																? "border-[#A8E6CF] bg-[#A8E6CF]/10 text-[#2d2d2d] shadow-sm"
																: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-[#2d2d2d]"
														}`}
														title={g.description}
													>
														<span className="truncate max-w-[14rem] inline-block align-middle">{giftChipLabel(g)}</span>
														{g.thankYouSent && (
															<CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-[#A8E6CF] bg-white rounded-full" />
														)}
													</button>
												);
											})}
										</div>
									</div>
								)}

								{/* Composer toolbar (integrated settings) */}
								<div className="rounded-xl border bg-white/80 shadow-xs overflow-hidden">
									<div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur p-3">
										<div className="flex flex-wrap items-center gap-2">
											<Tabs value={channel} onValueChange={(v) => setChannel(v as Channel)}>
												<TabsList className="h-9 bg-gradient-to-r from-white to-gray-50">
													{(["email", "text", "card"] as Channel[]).map((ch) => {
														const Icon = getChannelIcon(ch);
														return (
															<TabsTrigger key={ch} value={ch} className="px-3">
																<Icon className="mr-1 h-4 w-4" />
																{capitalize(ch)}
															</TabsTrigger>
														);
													})}
												</TabsList>
											</Tabs>

											<Select value={relationship} onValueChange={(v) => setRelationship(v as Relationship)}>
												<SelectTrigger className="h-9 w-[140px]">
													<SelectValue placeholder="Relationship" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="friend">Friend</SelectItem>
													<SelectItem value="family">Family</SelectItem>
													<SelectItem value="coworker">Coworker</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>

											<Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
												<SelectTrigger className="h-9 w-[130px]">
													<SelectValue placeholder="Tone" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="warm">Warm</SelectItem>
													<SelectItem value="formal">Formal</SelectItem>
													<SelectItem value="playful">Playful</SelectItem>
												</SelectContent>
											</Select>

											<Button
												type="button"
												variant="outline"
												className="ml-auto gap-1 border-gray-300 hover:bg-gray-50"
												onClick={() => setShowAdvanced((s) => !s)}
											>
												<Settings2 className="h-4 w-4" />
												More
												<ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
											</Button>
										</div>
									</div>

									{showAdvanced && (
										<div className="p-3">
											<div className="grid gap-3 sm:grid-cols-2">
												<div className="min-w-0">
													<label className="text-sm font-medium text-[#2d2d2d] mb-2 block">Occasion</label>
													<Select value={occasion} onValueChange={setOccasion}>
														<SelectTrigger className="w-full">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="wedding">Wedding</SelectItem>
															<SelectItem value="birthday">Birthday</SelectItem>
															<SelectItem value="holiday">Holiday</SelectItem>
															<SelectItem value="general">General</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="sm:col-span-2">
													<label className="text-sm font-medium text-[#2d2d2d] mb-2 block">
														Personal touch <span className="text-gray-500 font-normal">(optional)</span>
													</label>
													<Textarea
														value={personalTouch}
														onChange={(e) => setPersonalTouch(e.target.value)}
														placeholder="Add specific memories, inside jokes, or personal details..."
														className="min-h-[80px] resize-y"
													/>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Preview with gradient frame */}
								<div className="p-[2px] rounded-2xl bg-gradient-to-r from-[#A8E6CF] via-[#98CFBA] to-[#A8E6CF]">
									<div className={`rounded-xl border overflow-hidden transition-all duration-300 ${isGenerating ? "border-[#A8E6CF]/60 bg-[#A8E6CF]/10" : "border-gray-200 bg-white/80"}`}>
										<div className="p-6 max-h-[50vh] overflow-y-auto overscroll-contain">
											{isGenerating ? (
												<div className="flex flex-col items-center justify-center py-8 text-center">
													<div className="animate-spin mb-4">
														<Sparkles className="h-8 w-8 text-[#A8E6CF]" />
													</div>
													<div className="text-lg font-semibold text-[#2d2d2d] mb-2">Crafting your note...</div>
													<div className="text-gray-600">AI is writing a heartfelt message just for you</div>
												</div>
											) : content ? (
												<div className="prose prose-sm max-w-none break-words">
													<div className="whitespace-pre-wrap break-words break-all text-[#2d2d2d] leading-relaxed overflow-x-auto font-serif text-[15px]">
														{content}
													</div>
												</div>
											) : (
												<div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
													<Sparkles className="h-8 w-8 mb-4" />
													<div>Click &quot;Generate Note&quot; to create your message</div>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-col sm:flex-row flex-wrap gap-3">
									<Button
										onClick={generateNote}
										disabled={isGenerating || !selectedGift}
										className="flex-1 bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] hover:opacity-90 min-w-0 active:scale-[0.99] transition-transform"
									>
										{isGenerating ? (
											<>
												<div className="animate-spin mr-2">
													<Sparkles className="h-4 w-4" />
												</div>
												<span className="truncate">Generating...</span>
											</>
										) : (
											<>
												<Sparkles className="mr-2 h-4 w-4" />
												<span className="truncate">{content ? "Regenerate Note" : "Generate Note"}</span>
											</>
										)}
									</Button>

									<Button
										onClick={saveDraft}
										variant="outline"
										disabled={!content || isGenerating || !selectedGift}
										className="border-gray-300 hover:bg-gray-50 min-w-0 active:scale-[0.99] transition-transform"
									>
										{saved ? (
											<>
												<Check className="mr-2 h-4 w-4" />
												<span className="truncate">Saved</span>
											</>
										) : (
											<>
												<RefreshCcw className="mr-2 h-4 w-4" />
												<span className="truncate">Save Draft</span>
											</>
										)}
									</Button>

									{/* Announce save status for screen readers */}
									<span aria-live="polite" className="sr-only">{saved ? "Draft saved" : ""}</span>

									<Button
										onClick={copyToClipboard}
										variant="outline"
										disabled={!content || isGenerating || !selectedGift}
										className="border-gray-300 hover:bg-gray-50 min-w-0 active:scale-[0.99] transition-transform"
									>
										{copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
										<span className="truncate">{copied ? "Copied" : "Copy"}</span>
									</Button>

									{content && channel === "email" && (
										<Button asChild className="min-w-0 bg-gradient-to-br from-[#38b2ac] to-[#A8E6CF] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform">
											<a href={buildMailtoUrl("Thank you!", content)} target="_blank" rel="noopener noreferrer">Compose Email</a>
										</Button>
									)}
									{content && channel === "text" && (
										<Button asChild className="min-w-0 bg-gradient-to-br from-[#38b2ac] to-[#A8E6CF] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform">
											<a href={buildSmsUrl(content)}>Open SMS</a>
										</Button>
									)}
									{content && channel === "card" && (
										<Button onClick={() => printNote(content)} className="min-w-0 bg-gradient-to-br from-[#38b2ac] to-[#A8E6CF] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform">
											Print
										</Button>
									)}

									<Button
										onClick={async () => {
											if (!selectedGift || !content.trim()) return;
											const form = new FormData();
											form.set("note_id", (currentPersistedNote && currentPersistedNote.id) || "");
											form.set("list_id", listId);
											form.set("gift_id", selectedGift.id);
											form.set("channel", channel);
											form.set("relationship", relationship);
											form.set("tone", tone);
											form.set("content", content);
											form.set("occasion", occasion);
											form.set("personal_touch", personalTouch);
											await sendThankYouNoteAction(form);
											setTimeout(fireConfetti, 0);
											router.refresh();
										}}
										disabled={isGenerating || !selectedGift || !content.trim()}
										className="min-w-0 bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform"
									>
										<CheckCircle2 className="mr-2 h-4 w-4" />
										<span className="truncate">Mark as Sent</span>
									</Button>
								</div>

								{/* Helper */}
								<div className="text-xs text-gray-500 bg-gray-50/60 rounded-lg p-3">
									💡 <strong>Tip:</strong> Use the toolbar to tailor tone and relationship. Open “More” for occasion and personal touches.
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function appendMeta(base: string, personal: string, occ: string) {
	let extra = "";
	if (personal?.trim()) {
		extra += `\n\nP.S. ${personal.trim()}`;
	}
	if (occ && occ !== "general") {
		extra += `\n\n(Occasion: ${capitalize(occ)})`;
	}
	return (base + extra).trim();
}

function capitalize(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}