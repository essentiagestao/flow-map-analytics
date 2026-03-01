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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      board_v1_assets: {
        Row: {
          board_id: string
          created_at: string
          id: string
          meta: Json | null
          owner_id: string
          storage_path: string
          type: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          meta?: Json | null
          owner_id: string
          storage_path: string
          type?: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          meta?: Json | null
          owner_id?: string
          storage_path?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_v1_assets_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_v1_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      board_v1_boards: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          settings: Json | null
          title: string
          updated_at: string
          viewport: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          settings?: Json | null
          title?: string
          updated_at?: string
          viewport?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          settings?: Json | null
          title?: string
          updated_at?: string
          viewport?: Json | null
        }
        Relationships: []
      }
      board_v1_chunks: {
        Row: {
          board_id: string
          bounds: Json
          chunk_key: string
          id: string
          items: Json
          section_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          board_id: string
          bounds?: Json
          chunk_key: string
          id?: string
          items?: Json
          section_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          board_id?: string
          bounds?: Json
          chunk_key?: string
          id?: string
          items?: Json
          section_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_v1_chunks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_v1_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_v1_chunks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "board_v1_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      board_v1_sections: {
        Row: {
          board_id: string
          id: string
          is_hidden: boolean
          order_index: number
          title: string
        }
        Insert: {
          board_id: string
          id?: string
          is_hidden?: boolean
          order_index?: number
          title?: string
        }
        Update: {
          board_id?: string
          id?: string
          is_hidden?: boolean
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_v1_sections_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board_v1_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          canvas_data: Json
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          share_link: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          share_link?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          share_link?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_templates: {
        Row: {
          author_id: string
          author_name: string | null
          canvas_data: Json
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_approved: boolean | null
          name: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          author_id: string
          author_name?: string | null
          canvas_data?: Json
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_approved?: boolean | null
          name: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          author_id?: string
          author_name?: string | null
          canvas_data?: Json
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      board_v1_is_owner: { Args: { _board_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
