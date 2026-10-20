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
      assessments: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          employer_id: string
          id: string
          pass_mark: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          employer_id: string
          id?: string
          pass_mark?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          employer_id?: string
          id?: string
          pass_mark?: number
          title?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          answers: Json
          assessment_id: string
          copy_events: number
          employer_id: string
          events: Json
          graduate_id: string
          id: string
          invitation_id: string
          score: number | null
          started_at: string
          submitted_at: string | null
          tab_switches: number
          total: number | null
        }
        Insert: {
          answers?: Json
          assessment_id: string
          copy_events?: number
          employer_id: string
          events?: Json
          graduate_id: string
          id?: string
          invitation_id: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          tab_switches?: number
          total?: number | null
        }
        Update: {
          answers?: Json
          assessment_id?: string
          copy_events?: number
          employer_id?: string
          events?: Json
          graduate_id?: string
          id?: string
          invitation_id?: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          tab_switches?: number
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
          path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          name: string
          path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
          path?: string
          user_id?: string
        }
        Relationships: []
      }
      employers: {
        Row: {
          address: string | null
          approved: boolean
          company_name: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          industry: string | null
          rc_number: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          approved?: boolean
          company_name?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          industry?: string | null
          rc_number?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          approved?: boolean
          company_name?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          industry?: string | null
          rc_number?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      graduate_profiles: {
        Row: {
          available: boolean
          bio: string | null
          cgpa: number | null
          course: string | null
          created_at: string
          date_of_birth: string | null
          degree_class: string | null
          email: string | null
          faculty: string | null
          full_name: string
          gender: string | null
          graduation_year: number | null
          institution: string | null
          institution_type: string | null
          nysc_status: string | null
          phone: string | null
          preferred_location: string | null
          qualification: string | null
          skills: string[]
          state_of_residence: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean
          bio?: string | null
          cgpa?: number | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          degree_class?: string | null
          email?: string | null
          faculty?: string | null
          full_name?: string
          gender?: string | null
          graduation_year?: number | null
          institution?: string | null
          institution_type?: string | null
          nysc_status?: string | null
          phone?: string | null
          preferred_location?: string | null
          qualification?: string | null
          skills?: string[]
          state_of_residence?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean
          bio?: string | null
          cgpa?: number | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          degree_class?: string | null
          email?: string | null
          faculty?: string | null
          full_name?: string
          gender?: string | null
          graduation_year?: number | null
          institution?: string | null
          institution_type?: string | null
          nysc_status?: string | null
          phone?: string | null
          preferred_location?: string | null
          qualification?: string | null
          skills?: string[]
          state_of_residence?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          assessment_id: string | null
          created_at: string
          employer_id: string
          graduate_id: string
          id: string
          kind: string
          location: string | null
          message: string | null
          scheduled_at: string | null
          status: string
          title: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          employer_id: string
          graduate_id: string
          id?: string
          kind?: string
          location?: string | null
          message?: string | null
          scheduled_at?: string | null
          status?: string
          title: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          employer_id?: string
          graduate_id?: string
          id?: string
          kind?: string
          location?: string | null
          message?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          assessment_id: string
          correct_index: number
          id: string
          options: Json
          position: number
          prompt: string
        }
        Insert: {
          assessment_id: string
          correct_index?: number
          id?: string
          options?: Json
          position?: number
          prompt: string
        }
        Update: {
          assessment_id?: string
          correct_index?: number
          id?: string
          options?: Json
          position?: number
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_attempt_questions: {
        Args: { _attempt_id: string }
        Returns: {
          id: string
          options: Json
          prompt: string
          q_position: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_employer: { Args: { _uid: string }; Returns: boolean }
      log_attempt_event: {
        Args: { _attempt_id: string; _kind: string }
        Returns: undefined
      }
      set_my_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      start_attempt: { Args: { _invitation_id: string }; Returns: string }
      submit_attempt: {
        Args: { _answers: Json; _attempt_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "employer" | "graduate"
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
      app_role: ["admin", "employer", "graduate"],
    },
  },
} as const
