"use client";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Eye, Pencil } from "lucide-react";

export function MessageSurface({
  content,
  onChangeContent,
  isGenerating,
  mode,
  setMode,
  showEditHint,
  canEdit,
}: {
  content: string;
  onChangeContent: (v: string) => void;
  isGenerating: boolean;
  mode: "edit" | "preview";
  setMode: (m: "edit" | "preview") => void;
  showEditHint: boolean;
  canEdit: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/90 shadow-sm">
      <div className="relative p-5 sm:p-6 max-h-[50vh] overflow-y-auto overscroll-contain">
        {content && (
          <button
            type="button"
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 hover:bg-gray-50 shadow-sm"
            title={mode === "edit" ? "Preview" : "Edit"}
          >
            {mode === "edit" ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        )}

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="animate-spin mb-4">
              <Sparkles className="h-8 w-8 text-[#A8E6CF]" />
            </div>
            <div className="text-lg font-semibold text-[#2d2d2d] mb-2">Crafting your note...</div>
            <div className="text-gray-600">AI is writing a heartfelt message just for you</div>
          </div>
        ) : mode === "edit" ? (
          <Textarea
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            placeholder="Type or edit your message here..."
            className="min-h-[220px] w-full max-h-[50vh] resize-y overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words bg-white/90 font-serif text-[15px]"
            disabled={!canEdit}
          />
        ) : content ? (
          <div className="prose prose-sm max-w-none break-words">
            <div className="whitespace-pre-wrap break-words break-all text-[#2d2d2d] leading-relaxed overflow-x-auto font-serif text-[16px] sm:text-[15px]">
              {content}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <Sparkles className="h-8 w-8 mb-4" />
            <div>Click &quot;Generate Note&quot; to create your message</div>
            {showEditHint ? (
              <div className="mt-2 text-xs text-gray-500">Tip: You can edit the note after it is generated.</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
