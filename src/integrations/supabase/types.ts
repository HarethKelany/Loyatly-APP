export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          code: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      passes: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_reward_ready: boolean
          push_token: string | null
          serial_number: string
          stamp_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_reward_ready?: boolean
          push_token?: string | null
          serial_number: string
          stamp_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_reward_ready?: boolean
          push_token?: string | null
          serial_number?: string
          stamp_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "passes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_configs: {
        Row: {
          active_from: string
          active_until: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          item_image_url: string | null
          item_name: string
          updated_at: string
        }
        Insert: {
          active_from?: string
          active_until?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          item_image_url?: string | null
          item_name: string
          updated_at?: string
        }
        Update: {
          active_from?: string
          active_until?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          item_image_url?: string | null
          item_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          customer_id: string
          id: string
          item_name: string
          redeemed_at: string
          redeemed_by: string
          reward_config_id: string
        }
        Insert: {
          customer_id: string
          id?: string
          item_name: string
          redeemed_at?: string
          redeemed_by: string
          reward_config_id: string
        }
        Update: {
          customer_id?: string
          id?: string
          item_name?: string
          redeemed_at?: string
          redeemed_by?: string
          reward_config_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_reward_config_id_fkey"
            columns: ["reward_config_id"]
            isOneToOne: false
            referencedRelation: "reward_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          password_hash: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          password_hash: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          logged_by: string | null
          method: Database["public"]["Enums"]["visit_method"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          logged_by?: string | null
          method?: Database["public"]["Enums"]["visit_method"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          logged_by?: string | null
          method?: Database["public"]["Enums"]["visit_method"]
        }
        Relationships: [
          {
            foreignKeyName: "visits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          customer_id: string | null
          error: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean
          received_at: string
          source: string
        }
        Insert: {
          customer_id?: string | null
          error?: string | null
          event_type: string
          id?: string
          payload?: Json
          processed?: boolean
          received_at?: string
          source: string
        }
        Update: {
          customer_id?: string | null
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          received_at?: string
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_customer_code: { Args: never; Returns: string }
    }
    Enums: {
      staff_role: "STAFF" | "ADMIN"
      visit_method: "AUTO" | "MANUAL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      staff_role: ["STAFF", "ADMIN"],
      visit_method: ["AUTO", "MANUAL"],
    },
  },
} as const
