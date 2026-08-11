// Hand-authored to match supabase/migrations/0001_schema.sql exactly.
// Once a live project exists, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
// and diff against this file before overwriting — Milestone 1c adds more
// call_insights columns that a fresh generation would already include.

export type UserRole = "manager" | "rep";
export type DbLeadSource = "excel" | "field" | "ziwo" | "website";
export type DbLeadStatus = "new" | "contacted" | "interested" | "followup" | "meeting" | "won" | "archived";
export type DbCallAnswered = "answered" | "noanswer" | "busy";
export type DbMeetingType = "inperson" | "online";
export type DbQuoteStatus = "pending" | "approved" | "rejected";
export type DbContractVia = "meeting" | "direct";
export type DbCallInsightStatus = "processing" | "analyzed";
export type DbCallSentiment = "positive" | "neutral" | "negative";
export type DbBuyingIntent = "low" | "medium" | "high";
export type DbFollowupTier = "cold" | "warm" | "hot" | "urgent";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          role: UserRole;
          perm_transfer: boolean;
          perm_receive: boolean;
          perm_add_field: boolean;
          perm_meetings: boolean;
          perm_quote: boolean;
          perm_content: boolean;
          checked_in: boolean;
          check_in_time: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      targets: {
        Row: {
          user_id: string;
          daily_calls: number;
          daily_visits: number;
          weekly_meetings: number;
          monthly_contracts: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["targets"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["targets"]["Row"]>;
        Relationships: [];
      };
      segments: {
        Row: {
          id: string;
          name_key: string | null;
          custom_name: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["segments"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["segments"]["Row"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          phone: string;
          email: string | null;
          location: string;
          segment_id: string | null;
          source: DbLeadSource;
          status: DbLeadStatus;
          assigned_to: string | null;
          notes: string;
          result: string | null;
          result_reason_key: string | null;
          phone_edits: number;
          mtg_postponed: number;
          transferred_from: string | null;
          transferred_at: string | null;
          decision_maker_name: string | null;
          decision_maker_name_en: string | null;
          decision_maker_phone: string | null;
          discount_official: number | null;
          discount_given: number | null;
          referral_code: string | null;
          referred_by_code: string | null;
          followup_escalated_at: string | null;
          followup_tier: DbFollowupTier | null;
          followup_tier_updated_at: string | null;
          followup_cadence_started_at: string | null;
          followup_step: number;
          followup_dormant_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["leads"]["Row"]> & { name: string; phone: string };
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>;
        Relationships: [];
      };
      followup_messages: {
        Row: {
          id: string;
          lead_id: string;
          tier: string;
          step: number;
          theme: string;
          message_ar: string;
          message_en: string;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["followup_messages"]["Row"]> & {
          lead_id: string;
          tier: string;
          step: number;
          theme: string;
          message_ar: string;
          message_en: string;
        };
        Update: Partial<Database["public"]["Tables"]["followup_messages"]["Row"]>;
        Relationships: [];
      };
      calls: {
        Row: {
          id: string;
          lead_id: string;
          rep_id: string | null;
          dur_sec: number;
          answered: DbCallAnswered;
          note: string | null;
          at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["calls"]["Row"]> & { lead_id: string; answered: DbCallAnswered };
        Update: Partial<Database["public"]["Tables"]["calls"]["Row"]>;
        Relationships: [];
      };
      visits: {
        Row: {
          id: string;
          lead_id: string;
          rep_id: string | null;
          verified: boolean;
          reviewed: boolean | null;
          note: string | null;
          contact: string | null;
          at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["visits"]["Row"]> & { lead_id: string };
        Update: Partial<Database["public"]["Tables"]["visits"]["Row"]>;
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          lead_id: string;
          rep_id: string | null;
          type: DbMeetingType;
          dt: string;
          done: boolean;
          missed: boolean;
          missed_reason_key: string | null;
          proof: boolean;
          notes: string | null;
          summary_ar: string | null;
          summary_en: string | null;
          next_steps_ar: string | null;
          next_steps_en: string | null;
          sentiment: string | null;
          summarized_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["meetings"]["Row"]> & { lead_id: string; type: DbMeetingType; dt: string };
        Update: Partial<Database["public"]["Tables"]["meetings"]["Row"]>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          lead_id: string;
          count: number;
          price: number;
          total: number;
          status: DbQuoteStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quotes"]["Row"]> & { lead_id: string; price: number; total: number };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Row"]>;
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          lead_id: string;
          months: number;
          monthly: number;
          total: number;
          via: DbContractVia;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contracts"]["Row"]> & {
          lead_id: string;
          months: number;
          monthly: number;
          total: number;
          via: DbContractVia;
        };
        Update: Partial<Database["public"]["Tables"]["contracts"]["Row"]>;
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          lead_id: string;
          who_id: string | null;
          key: string;
          params: Record<string, string | number | boolean> | null;
          at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activity_log"]["Row"]> & { lead_id: string; key: string };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Row"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          meta: Record<string, unknown> | null;
          at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & { action: string; entity_type: string };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
      content_items: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          file_type: string;
          storage_path: string | null;
          external_url: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["content_items"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["content_items"]["Row"]>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          description: string;
          amount: number;
          category: string;
          expense_date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]> & { description: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
        Relationships: [];
      };
      referral_rewards: {
        Row: {
          id: string;
          referrer_lead_id: string;
          referred_lead_id: string;
          referral_code: string;
          points: number;
          status: "pending" | "approved" | "paid" | "rejected";
          decided_by: string | null;
          decided_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["referral_rewards"]["Row"]> & {
          referrer_lead_id: string;
          referred_lead_id: string;
          referral_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["referral_rewards"]["Row"]>;
        Relationships: [];
      };
      pricing_packages: {
        Row: {
          id: string;
          price: number | null;
          hours: number | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pricing_packages"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["pricing_packages"]["Row"]>;
        Relationships: [];
      };
      pricing_settings: {
        Row: {
          id: boolean;
          min_price: number;
        };
        Insert: Partial<Database["public"]["Tables"]["pricing_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["pricing_settings"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          lead_id: string | null;
          kind: string;
          title: string | null;
          body: string | null;
          params: unknown;
          urgent: boolean;
          read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & { user_id: string; kind: string };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      call_insights: {
        Row: {
          id: string;
          ziwo_call_id: string;
          lead_id: string | null;
          rep_id: string | null;
          lead_phone: string | null;
          at: string | null;
          dur_sec: number | null;
          status: DbCallInsightStatus;
          result: string | null;
          recording_url: string | null;
          transcript: unknown | null;
          summary_ar: string | null;
          summary_en: string | null;
          sentiment: DbCallSentiment | null;
          sentiment_score: number | null;
          intent_ar: string | null;
          intent_en: string | null;
          buying_intent: DbBuyingIntent | null;
          lead_score: number | null;
          objections: unknown | null;
          action_items: unknown | null;
          ai_notes_ar: string | null;
          ai_notes_en: string | null;
          next_followup_channel: string | null;
          next_followup_at: string | null;
          next_followup_recommendation_ar: string | null;
          next_followup_recommendation_en: string | null;
          whatsapp_sent: boolean;
          processing_log: unknown;
          analysis_claimed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["call_insights"]["Row"]> & { ziwo_call_id: string };
        Update: Partial<Database["public"]["Tables"]["call_insights"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      daily_stats: {
        Row: {
          user_id: string | null;
          day: string | null;
          calls: number | null;
          visits: number | null;
          meetings: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
