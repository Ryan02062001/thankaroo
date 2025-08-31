"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings2, ChevronDown } from "lucide-react";
import { getChannelIcon } from "./utils";
import { capitalize } from "./utils";
import type { Channel, Relationship, Tone } from "@/app/contexts/ReminderContext";

export function ComposerToolbar({
  channel, setChannel,
  relationship, setRelationship,
  tone, setTone,
  showAdvanced, toggleAdvanced,
}: {
  channel: Channel; setChannel: (c: Channel) => void;
  relationship: Relationship; setRelationship: (r: Relationship) => void;
  tone: Tone; setTone: (t: Tone) => void;
  showAdvanced: boolean; toggleAdvanced: () => void;
}) {
  return (
    <section className="rounded-xl border bg-white/80 shadow-sm overflow-hidden" aria-labelledby="composer-toolbar-heading">
      <h2 id="composer-toolbar-heading" className="sr-only">Composer options</h2>
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
            onClick={toggleAdvanced}
          >
            <Settings2 className="h-4 w-4" />
            More
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>
    </section>
  );
}
