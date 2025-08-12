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
