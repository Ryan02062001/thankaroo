export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      gift_lists: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gift_lists_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
      reminder_settings: {
        Row: {
          id: string;
          list_id: string;
          default_intervals_days: number[]; // e.g., [7,14]
          default_channel: "email" | "text" | "card";
          auto_generate_drafts: boolean;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          default_intervals_days?: number[];
          default_channel?: "email" | "text" | "card";
          auto_generate_drafts?: boolean;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reminder_settings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reminder_settings_list_id_fkey";
            columns: ["list_id"];
            referencedRelation: "gift_lists";
            referencedSchema: "public";
            referencedColumns: ["id"];
          }
        ];
      };
      reminders: {
        Row: {
          id: string;
          list_id: string;
          gift_id: string;
          due_at: string; // YYYY-MM-DD (date only)
          channel: "email" | "text" | "card";
          sent: boolean;
          created_at: string;
          gift_snapshot: {
            guestName: string;
            description: string;
            date: string; // YYYY-MM-DD
          };
        };
        Insert: {
          id?: string;
          list_id: string;
          gift_id: string;
          due_at: string;
          channel: "email" | "text" | "card";
          sent?: boolean;
          created_at?: string;
          gift_snapshot: Database["public"]["Tables"]["reminders"]["Row"]["gift_snapshot"];
        };
        Update: Partial<Database["public"]["Tables"]["reminders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reminders_list_id_fkey";
            columns: ["list_id"];
            referencedRelation: "gift_lists";
            referencedSchema: "public";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reminders_gift_id_fkey";
            columns: ["gift_id"];
            referencedRelation: "gifts";
            referencedSchema: "public";
            referencedColumns: ["id"];
          }
        ];
      };
      gifts: {
        Row: {
          id: string;
          list_id: string;
          guest_name: string;
          description: string;
          gift_type: Database["public"]["Enums"]["gift_type"];
          date_received: string;            // YYYY-MM-DD
          thank_you_sent: boolean;
          thank_you_sent_at: string | null; // ISO
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          guest_name: string;
          description: string;
          gift_type?: Database["public"]["Enums"]["gift_type"];
          date_received?: string;
          thank_you_sent?: boolean;
          thank_you_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gifts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "gifts_list_id_fkey";
            columns: ["list_id"];
            referencedRelation: "gift_lists";
            referencedSchema: "public";
            referencedColumns: ["id"];
          }
        ];
      };
      thank_you_notes: {
        Row: {
          id: string;
          list_id: string;
          gift_id: string;
          channel: "email" | "text" | "card";
          relationship: "friend" | "family" | "coworker" | "other";
          tone: "warm" | "formal" | "playful";
          status: "draft" | "sent";
          content: string;
          meta: Json;
          created_at: string;
          updated_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          list_id: string;
          gift_id: string;
          channel: "email" | "text" | "card";
          relationship: "friend" | "family" | "coworker" | "other";
          tone: "warm" | "formal" | "playful";
          status?: "draft" | "sent";
          content: string;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["thank_you_notes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "thank_you_notes_list_id_fkey";
            columns: ["list_id"];
            referencedRelation: "gift_lists";
            referencedSchema: "public";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "thank_you_notes_gift_id_fkey";
            columns: ["gift_id"];
            referencedRelation: "gifts";
            referencedSchema: "public";
            referencedColumns: ["id"];
          }
        ];
      };
      usage_monthly: {
        Row: {
          user_id: string;
          period_month: string; // YYYY-MM-01
          ai_drafts: number;
        };
        Insert: {
          user_id: string;
          period_month: string;
          ai_drafts?: number;
        };
        Update: Partial<Database["public"]["Tables"]["usage_monthly"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: string; // not strictly necessary to name here
            columns: ["user_id"];
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_customers: {
        Row: {
          user_id: string;
          stripe_customer_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          stripe_customer_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_customers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: string;
            columns: ["user_id"];
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          price_lookup_key: string | null;
          status: string;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          price_lookup_key?: string | null;
          status: string;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_subscriptions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: string;
            columns: ["user_id"];
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_entitlements: {
        Row: {
          id: string;
          user_id: string;
          product_lookup_key: string;
          active: boolean;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_lookup_key: string;
          active?: boolean;
          granted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_entitlements"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: string;
            columns: ["user_id"];
            referencedRelation: "users";
            referencedSchema: "auth";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gift_type: "non registry" | "monetary" | "registry" | "multiple";
    };
    CompositeTypes: Record<string, never>;
  };
};

// narrow alias
export type GiftType = Database["public"]["Enums"]["gift_type"];
