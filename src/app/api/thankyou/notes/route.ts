import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Channel = "email" | "text" | "card";
type Relationship = "friend" | "family" | "coworker" | "other";
type Tone = "warm" | "formal" | "playful";

async function requireUserOrThrow(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Not authenticated");
  return auth.user;
}

async function assertListOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("gift_lists")
    .select("id")
    .eq("id", listId)
    .eq("owner_id", userId)
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const listId = url.searchParams.get("listId") ?? "";
    const supabase = await createClient();
    const user = await requireUserOrThrow(supabase);
    await assertListOwnership(supabase, listId, user.id);

    const { data, error } = await supabase
      .from("thank_you_notes")
      .select("id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at")
      .eq("list_id", listId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ notes: data ?? [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      listId: string;
      giftId: string;
      channel: Channel;
      relationship: Relationship;
      tone: Tone;
      content: string;
      occasion?: string;
      personalTouch?: string;
      status?: "draft" | "sent";
    };
    const supabase = await createClient();
    const user = await requireUserOrThrow(supabase);
    await assertListOwnership(supabase, body.listId, user.id);

    const meta = { occasion: body.occasion ?? null, personalTouch: body.personalTouch ?? null } as const;
    const status = body.status ?? "draft";
    const sent_at = status === "sent" ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from("thank_you_notes")
      .insert({
        list_id: body.listId,
        gift_id: body.giftId,
        channel: body.channel,
        relationship: body.relationship,
        tone: body.tone,
        content: body.content,
        meta,
        status,
        sent_at,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create note");

    if (status === "sent") {
      await supabase
        .from("gifts")
        .update({ thank_you_sent: true, thank_you_sent_at: sent_at })
        .eq("id", body.giftId);
    }
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as {
      id: string;
      listId: string;
      giftId: string;
      channel: Channel;
      relationship: Relationship;
      tone: Tone;
      content: string;
      occasion?: string;
      personalTouch?: string;
      status?: "draft" | "sent";
    };
    const supabase = await createClient();
    const user = await requireUserOrThrow(supabase);
    await assertListOwnership(supabase, body.listId, user.id);

    const meta = { occasion: body.occasion ?? null, personalTouch: body.personalTouch ?? null } as const;
    const sentNow = body.status === "sent" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("thank_you_notes")
      .update({
        channel: body.channel,
        relationship: body.relationship,
        tone: body.tone,
        content: body.content,
        meta,
        status: body.status ?? "draft",
        sent_at: sentNow,
      })
      .eq("id", body.id);
    if (error) throw new Error(error.message);

    if (body.status === "sent") {
      await supabase
        .from("gifts")
        .update({ thank_you_sent: true, thank_you_sent_at: sentNow })
        .eq("id", body.giftId);
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id") ?? "";
    const listId = url.searchParams.get("listId") ?? "";
    const supabase = await createClient();
    const user = await requireUserOrThrow(supabase);
    await assertListOwnership(supabase, listId, user.id);

    const { error } = await supabase.from("thank_you_notes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


