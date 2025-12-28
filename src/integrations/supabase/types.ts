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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean | null
          listing_id: string
          open_time: string | null
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          listing_id: string
          open_time?: string | null
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          listing_id?: string
          open_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      business_listings: {
        Row: {
          address: string | null
          business_name: string
          category: string
          claim_token: string | null
          claimed: boolean | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          is_published: boolean | null
          linkedin_url: string | null
          owner_name: string | null
          phone: string | null
          place_id: string | null
          status: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          category: string
          claim_token?: string | null
          claimed?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_published?: boolean | null
          linkedin_url?: string | null
          owner_name?: string | null
          phone?: string | null
          place_id?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string
          claim_token?: string | null
          claimed?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_published?: boolean | null
          linkedin_url?: string | null
          owner_name?: string | null
          phone?: string | null
          place_id?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_photos: {
        Row: {
          created_at: string
          display_order: number | null
          file_name: string
          file_size: number | null
          id: string
          is_primary: boolean | null
          listing_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          file_name: string
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          file_name?: string
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      business_services: {
        Row: {
          asset_class: string | null
          axle_configuration: string | null
          ball_size: string | null
          created_at: string
          daily_rate: number | null
          description: string | null
          dimensions: string | null
          display_order: number | null
          electrical_plug: string | null
          empty_weight: string | null
          features: string[] | null
          hitch_connection: string | null
          id: string
          is_available: boolean | null
          length_ft: string | null
          listing_id: string
          monthly_rate: number | null
          payload_capacity: string | null
          price: number | null
          price_unit: string | null
          service_name: string
          sub_category: string | null
          three_day_rate: number | null
          traction_type: string | null
          updated_at: string
          weekly_rate: number | null
          year_make_model: string | null
          youtube_url: string | null
        }
        Insert: {
          asset_class?: string | null
          axle_configuration?: string | null
          ball_size?: string | null
          created_at?: string
          daily_rate?: number | null
          description?: string | null
          dimensions?: string | null
          display_order?: number | null
          electrical_plug?: string | null
          empty_weight?: string | null
          features?: string[] | null
          hitch_connection?: string | null
          id?: string
          is_available?: boolean | null
          length_ft?: string | null
          listing_id: string
          monthly_rate?: number | null
          payload_capacity?: string | null
          price?: number | null
          price_unit?: string | null
          service_name: string
          sub_category?: string | null
          three_day_rate?: number | null
          traction_type?: string | null
          updated_at?: string
          weekly_rate?: number | null
          year_make_model?: string | null
          youtube_url?: string | null
        }
        Update: {
          asset_class?: string | null
          axle_configuration?: string | null
          ball_size?: string | null
          created_at?: string
          daily_rate?: number | null
          description?: string | null
          dimensions?: string | null
          display_order?: number | null
          electrical_plug?: string | null
          empty_weight?: string | null
          features?: string[] | null
          hitch_connection?: string | null
          id?: string
          is_available?: boolean | null
          length_ft?: string | null
          listing_id?: string
          monthly_rate?: number | null
          payload_capacity?: string | null
          price?: number | null
          price_unit?: string | null
          service_name?: string
          sub_category?: string | null
          three_day_rate?: number | null
          traction_type?: string | null
          updated_at?: string
          weekly_rate?: number | null
          year_make_model?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_services_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_published: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gmb_connections: {
        Row: {
          account_email: string
          connected_at: string
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          sync_frequency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_email: string
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          sync_frequency?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_email?: string
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          sync_frequency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gmb_reviews: {
        Row: {
          admin_hidden: boolean | null
          author: string
          business_id: string
          created_at: string
          expires_at: string
          fetched_at: string
          id: string
          rating: number
          review_date: string | null
          review_text: string | null
        }
        Insert: {
          admin_hidden?: boolean | null
          author: string
          business_id: string
          created_at?: string
          expires_at?: string
          fetched_at?: string
          id?: string
          rating: number
          review_date?: string | null
          review_text?: string | null
        }
        Update: {
          admin_hidden?: boolean | null
          author?: string
          business_id?: string
          created_at?: string
          expires_at?: string
          fetched_at?: string
          id?: string
          rating?: number
          review_date?: string | null
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gmb_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      import_history: {
        Row: {
          completed_at: string | null
          created_at: string
          error_log: Json | null
          failed_rows: number
          file_name: string
          id: string
          status: string
          successful_rows: number
          total_rows: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          failed_rows?: number
          file_name: string
          id?: string
          status?: string
          successful_rows?: number
          total_rows?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          failed_rows?: number
          file_name?: string
          id?: string
          status?: string
          successful_rows?: number
          total_rows?: number
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          created_at: string
          host_id: string
          id: string
          interaction_type: string
          ip_hash: string | null
          service_id: string | null
          source: string | null
          trigger_link_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          host_id: string
          id?: string
          interaction_type: string
          ip_hash?: string | null
          service_id?: string | null
          source?: string | null
          trigger_link_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          host_id?: string
          id?: string
          interaction_type?: string
          ip_hash?: string | null
          service_id?: string | null
          source?: string | null
          trigger_link_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_trigger_link_id_fkey"
            columns: ["trigger_link_id"]
            isOneToOne: false
            referencedRelation: "trigger_links"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_id: string
          created_at: string
          date_needed: string | null
          email: string
          id: string
          location: string | null
          message: string | null
          name: string
          phone: string
          review_email_sent: boolean | null
          review_email_sent_at: string | null
          review_token: string | null
          service_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          date_needed?: string | null
          email: string
          id?: string
          location?: string | null
          message?: string | null
          name: string
          phone: string
          review_email_sent?: boolean | null
          review_email_sent_at?: string | null
          review_token?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          date_needed?: string | null
          email?: string
          id?: string
          location?: string | null
          message?: string | null
          name?: string
          phone?: string
          review_email_sent?: boolean | null
          review_email_sent_at?: string | null
          review_token?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      listing_analytics: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          listing_id: string
          search_impressions: number | null
          views: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          listing_id: string
          search_impressions?: number | null
          views?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          listing_id?: string
          search_impressions?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_analytics_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          id: string
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string
          id: string
          location: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email: string
          id: string
          location?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          location?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          area_type: string
          created_at: string
          id: string
          listing_id: string
          radius_miles: number | null
          updated_at: string
          zip_codes: string[] | null
        }
        Insert: {
          area_type: string
          created_at?: string
          id?: string
          listing_id: string
          radius_miles?: number | null
          updated_at?: string
          zip_codes?: string[] | null
        }
        Update: {
          area_type?: string
          created_at?: string
          id?: string
          listing_id?: string
          radius_miles?: number | null
          updated_at?: string
          zip_codes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_areas_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_photos: {
        Row: {
          created_at: string
          display_order: number | null
          file_name: string
          file_size: number | null
          id: string
          is_primary: boolean | null
          service_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          file_name: string
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          service_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          file_name?: string
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          service_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_photos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trigger_links: {
        Row: {
          click_count: number | null
          code: string
          created_at: string
          destination: string
          host_id: string
          id: string
          link_type: string
        }
        Insert: {
          click_count?: number | null
          code: string
          created_at?: string
          destination: string
          host_id: string
          id?: string
          link_type: string
        }
        Update: {
          click_count?: number | null
          code?: string
          created_at?: string
          destination?: string
          host_id?: string
          id?: string
          link_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trigger_links_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
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
      your_reviews: {
        Row: {
          author_email: string | null
          author_name: string
          business_id: string
          created_at: string
          id: string
          lead_id: string | null
          rating: number
          review_text: string | null
          show_initials: boolean | null
          vendor_response: string | null
          vendor_response_at: string | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          business_id: string
          created_at?: string
          id?: string
          lead_id?: string | null
          rating: number
          review_text?: string | null
          show_initials?: boolean | null
          vendor_response?: string | null
          vendor_response_at?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          business_id?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          rating?: number
          review_text?: string | null
          show_initials?: boolean | null
          vendor_response?: string | null
          vendor_response_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "your_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "your_reviews_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
