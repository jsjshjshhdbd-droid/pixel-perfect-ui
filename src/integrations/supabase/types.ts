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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          target: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target?: string | null
        }
        Relationships: []
      }
      content_items: {
        Row: {
          category: string | null
          cover_path: string | null
          created_at: string
          description: string
          duration_label: string
          id: string
          instructions: string | null
          kind: Database["public"]["Enums"]["content_kind"]
          location: string | null
          objective: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["publish_status"]
          subtitle: string
          title: string
          tone: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string
          duration_label?: string
          id?: string
          instructions?: string | null
          kind: Database["public"]["Enums"]["content_kind"]
          location?: string | null
          objective?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          subtitle?: string
          title: string
          tone?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string
          duration_label?: string
          id?: string
          instructions?: string | null
          kind?: Database["public"]["Enums"]["content_kind"]
          location?: string | null
          objective?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          subtitle?: string
          title?: string
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          content_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_id: string
          created_at: string
          description: string
          id: string
          material_path: string | null
          minutes: number
          module_id: string | null
          sets_reps: string | null
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          description?: string
          id?: string
          material_path?: string | null
          minutes?: number
          module_id?: string | null
          sets_reps?: string | null
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          description?: string
          id?: string
          material_path?: string | null
          minutes?: number
          module_id?: string | null
          sets_reps?: string | null
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          content_id: string
          created_at: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_contents: {
        Row: {
          content_id: string
          product_id: string
        }
        Insert: {
          content_id: string
          product_id: string
        }
        Update: {
          content_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_contents_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_contents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          checkout_url: string | null
          created_at: string
          description: string
          id: string
          is_main: boolean
          offer_text: string | null
          price_label: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["publish_status"]
          title: string
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_main?: boolean
          offer_text?: string | null
          price_label?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
        }
        Update: {
          checkout_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_main?: boolean
          offer_text?: string | null
          price_label?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          height_cm: number | null
          id: string
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          height_cm?: number | null
          id: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          height_cm?: number | null
          id?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      recipe_categories: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          sort_order: number
          text: string
        }
        Insert: {
          id?: string
          recipe_id: string
          sort_order?: number
          text: string
        }
        Update: {
          id?: string
          recipe_id?: string
          sort_order?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories_kcal: number | null
          category_id: string | null
          collection_id: string
          created_at: string
          description: string
          id: string
          image_path: string | null
          instructions: string
          prep_minutes: number | null
          protein_g: number | null
          servings: number | null
          sort_order: number
          status: Database["public"]["Enums"]["publish_status"]
          title: string
        }
        Insert: {
          calories_kcal?: number | null
          category_id?: string | null
          collection_id: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          instructions?: string
          prep_minutes?: number | null
          protein_g?: number | null
          servings?: number | null
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
        }
        Update: {
          calories_kcal?: number | null
          category_id?: string | null
          collection_id?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          instructions?: string
          prep_minutes?: number | null
          protein_g?: number | null
          servings?: number | null
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "recipe_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_entitlements: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_content: { Args: { _content_id: string }; Returns: boolean }
      content_lesson_titles: {
        Args: { _content_id: string }
        Returns: {
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      account_status: "active" | "suspended"
      app_role: "admin" | "user"
      content_kind: "treino" | "protocolo" | "receitas" | "material"
      publish_status: "draft" | "published"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_status: ["active", "suspended"],
      app_role: ["admin", "user"],
      content_kind: ["treino", "protocolo", "receitas", "material"],
      publish_status: ["draft", "published"],
    },
  },
} as const
