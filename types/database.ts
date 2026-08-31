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
    PostgrestVersion: '14.5'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          access_token: string
          car_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          end_date: string
          expires_at: string | null
          id: string
          start_date: string
          status: Database['public']['Enums']['booking_status']
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string
          car_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          end_date: string
          expires_at?: string | null
          id?: string
          start_date: string
          status?: Database['public']['Enums']['booking_status']
          total_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          car_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          end_date?: string
          expires_at?: string | null
          id?: string
          start_date?: string
          status?: Database['public']['Enums']['booking_status']
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_car_id_fkey'
            columns: ['car_id']
            isOneToOne: false
            referencedRelation: 'cars'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      cars: {
        Row: {
          category: Database['public']['Enums']['car_category']
          created_at: string
          description: string | null
          fuel_type: Database['public']['Enums']['fuel_type']
          id: string
          image_urls: string[]
          make: string
          model: string
          price_per_day: number
          status: Database['public']['Enums']['car_status']
          transmission: Database['public']['Enums']['transmission']
          updated_at: string
          year: number
        }
        Insert: {
          category: Database['public']['Enums']['car_category']
          created_at?: string
          description?: string | null
          fuel_type?: Database['public']['Enums']['fuel_type']
          id?: string
          image_urls?: string[]
          make: string
          model: string
          price_per_day: number
          status?: Database['public']['Enums']['car_status']
          transmission?: Database['public']['Enums']['transmission']
          updated_at?: string
          year: number
        }
        Update: {
          category?: Database['public']['Enums']['car_category']
          created_at?: string
          description?: string | null
          fuel_type?: Database['public']['Enums']['fuel_type']
          id?: string
          image_urls?: string[]
          make?: string
          model?: string
          price_per_day?: number
          status?: Database['public']['Enums']['car_status']
          transmission?: Database['public']['Enums']['transmission']
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database['public']['Enums']['user_role']
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      expire_stale_bookings: { Args: never; Returns: number }
      car_booked_ranges: {
        Args: { p_car_id: string }
        Returns: { start_date: string; end_date: string }[]
      }
      is_car_available: {
        Args: { p_car_id: string; p_start: string; p_end: string }
        Returns: boolean
      }
      cars_booked_between: {
        Args: { p_start: string; p_end: string }
        Returns: { car_id: string }[]
      }
    }
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
      car_category: 'suv' | 'sedan' | 'economy'
      car_status: 'available' | 'maintenance' | 'retired'
      fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric'
      transmission: 'automatic' | 'manual'
      user_role: 'user' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: ['pending', 'confirmed', 'cancelled', 'completed'],
      car_category: ['suv', 'sedan', 'economy'],
      car_status: ['available', 'maintenance', 'retired'],
      fuel_type: ['petrol', 'diesel', 'hybrid', 'electric'],
      transmission: ['automatic', 'manual'],
      user_role: ['user', 'admin'],
    },
  },
} as const

// Convenience row aliases for app code.
export type Profile = Tables<'profiles'>
export type Car = Tables<'cars'>
export type Booking = Tables<'bookings'>
