"use client";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCcw, Check, Copy, CheckCircle2 } from "lucide-react";

export function ActionsBar({
  isGenerating,
  canGenerate,
  onGenerate,
  canSave,
  onSave,
  saved,
  canCopy,
  onCopy,
  copied,
  showEmailButton,
  emailHref,
  showSmsButton,
  smsHref,
  showPrintButton,
  onPrint,
  canMarkSent,
  onMarkSent,
}: {
  isGenerating: boolean;
  canGenerate: boolean;
  onGenerate: () => void;

  canSave: boolean;
  onSave: () => void;
  saved: boolean;

  canCopy: boolean;
  onCopy: () => void;
  copied: boolean;

  showEmailButton: boolean;
  emailHref: string;

  showSmsButton: boolean;
  smsHref: string;

  showPrintButton: boolean;
  onPrint: () => void;

  canMarkSent: boolean;
  onMarkSent: () => Promise<void> | void;
}) {
  return (
    <nav className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3" aria-label="Composer actions">
      <Button
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className="flex-1 bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] hover:opacity-90 min-w-0 active:scale-[0.99] transition-transform shadow-sm"
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
            <span className="truncate">Generate Note</span>
          </>
        )}
      </Button>

      <Button
        onClick={onSave}
        variant="outline"
        disabled={!canSave || isGenerating}
        className="border-gray-300 hover:bg-gray-50 min-w-0 active:scale-[0.99] transition-transform shadow-sm"
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

      <span aria-live="polite" className="sr-only">{saved ? "Draft saved" : ""}</span>

      <Button
        onClick={onCopy}
        variant="outline"
        disabled={!canCopy || isGenerating}
        className="border-gray-300 hover:bg-gray-50 min-w-0 active:scale-[0.99] transition-transform shadow-sm"
      >
        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        <span className="truncate">{copied ? "Copied" : "Copy"}</span>
      </Button>

      {showEmailButton && (
        <Button asChild className="min-w-0 bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform shadow-sm">
          <a href={emailHref} target="_blank" rel="noopener noreferrer">Compose Email</a>
        </Button>
      )}
      {showSmsButton && (
        <Button asChild className="min-w-0 bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform shadow-sm">
          <a href={smsHref}>Open SMS</a>
        </Button>
      )}
      {showPrintButton && (
        <Button onClick={onPrint} className="min-w-0 bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform shadow-sm">
          Print
        </Button>
      )}

      <Button
        onClick={() => void onMarkSent()}
        disabled={!canMarkSent || isGenerating}
        className="min-w-0 bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] hover:opacity-90 active:scale-[0.99] transition-transform shadow-sm"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        <span className="truncate">Mark as Sent</span>
      </Button>
    </nav>
  );
}
