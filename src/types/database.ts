export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      studios: {
        Row: {
          id: string; owner_id: string; name: string; slug: string
          type: 'personal' | 'studio' | 'micro_gym' | 'pilates' | 'crossfit' | 'yoga'
          logo_url: string | null; phone: string | null; email: string | null
          address: string | null; city: string | null; state: string | null
          zip_code: string | null; description: string | null
          coins_per_checkin: number; bonus_weekly_goal: number
          bonus_monthly_15: number; bonus_monthly_20: number; referral_bonus: number
          plan: 'trial' | 'starter' | 'pro' | 'enterprise'
          plan_status: 'trial' | 'active' | 'past_due' | 'cancelled'
          trial_ends_at: string | null; stripe_customer_id: string | null
          stripe_subscription_id: string | null; zapi_instance_id: string | null
          zapi_token: string | null; whatsapp_connected: boolean
          max_students: number; max_trainers: number; active: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; owner_id: string; name: string; slug: string
          type?: 'personal' | 'studio' | 'micro_gym' | 'pilates' | 'crossfit' | 'yoga'
          logo_url?: string | null; phone?: string | null; email?: string | null
          address?: string | null; city?: string | null; state?: string | null
          zip_code?: string | null; description?: string | null
          coins_per_checkin?: number; bonus_weekly_goal?: number
          bonus_monthly_15?: number; bonus_monthly_20?: number; referral_bonus?: number
          plan?: 'trial' | 'starter' | 'pro' | 'enterprise'
          plan_status?: 'trial' | 'active' | 'past_due' | 'cancelled'
          trial_ends_at?: string | null; stripe_customer_id?: string | null
          stripe_subscription_id?: string | null; zapi_instance_id?: string | null
          zapi_token?: string | null; whatsapp_connected?: boolean
          max_students?: number; max_trainers?: number; active?: boolean
        }
        Update: {
          name?: string; slug?: string
          type?: 'personal' | 'studio' | 'micro_gym' | 'pilates' | 'crossfit' | 'yoga'
          logo_url?: string | null; phone?: string | null; email?: string | null
          address?: string | null; city?: string | null
          plan?: 'trial' | 'starter' | 'pro' | 'enterprise'
          plan_status?: 'trial' | 'active' | 'past_due' | 'cancelled'
          stripe_customer_id?: string | null; stripe_subscription_id?: string | null
          max_students?: number; max_trainers?: number; active?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string; studio_id: string | null; full_name: string
          avatar_url: string | null; phone: string | null; role: string
          created_at: string; updated_at: string
        }
        Insert: {
          id: string; studio_id?: string | null; full_name: string
          avatar_url?: string | null; phone?: string | null; role?: string
        }
        Update: {
          studio_id?: string | null; full_name?: string
          avatar_url?: string | null; phone?: string | null; role?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string; studio_id: string; user_id: string | null; name: string
          email: string | null; phone: string; avatar_url: string | null
          birth_date: string | null; gender: string | null
          status: 'active' | 'inactive' | 'overdue' | 'suspended'
          plan_name: string | null; plan_price: number | null
          plan_start: string | null; plan_expiry: string | null; payment_day: number | null
          coins: number; total_checkins: number; monthly_checkins: number; level: string
          last_checkin_at: string | null; referral_code: string | null
          referred_by_id: string | null; joined_at: string; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; studio_id: string; user_id?: string | null; name: string
          email?: string | null; phone: string; avatar_url?: string | null
          birth_date?: string | null; gender?: string | null
          status?: 'active' | 'inactive' | 'overdue' | 'suspended'
          plan_name?: string | null; plan_price?: number | null
          plan_start?: string | null; plan_expiry?: string | null; payment_day?: number | null
          coins?: number; total_checkins?: number; monthly_checkins?: number; level?: string
          referred_by_id?: string | null
        }
        Update: {
          name?: string; email?: string | null; phone?: string; avatar_url?: string | null
          status?: 'active' | 'inactive' | 'overdue' | 'suspended'
          plan_name?: string | null; plan_price?: number | null
          plan_start?: string | null; plan_expiry?: string | null; payment_day?: number | null
          coins?: number; total_checkins?: number; monthly_checkins?: number; level?: string
          last_checkin_at?: string | null
        }
        Relationships: []
      }
      trainers: {
        Row: {
          id: string; studio_id: string; user_id: string | null; name: string
          email: string | null; phone: string | null; avatar_url: string | null
          specialty: string | null; bio: string | null; certifications: string | null
          active_students: number; rating: number | null; active: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; studio_id: string; user_id?: string | null; name: string
          email?: string | null; phone?: string | null; avatar_url?: string | null
          specialty?: string | null; bio?: string | null; certifications?: string | null
          active_students?: number; rating?: number | null; active?: boolean
        }
        Update: {
          name?: string; email?: string | null; phone?: string | null
          specialty?: string | null; bio?: string | null; active_students?: number
          rating?: number | null; active?: boolean
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string; studio_id: string; student_id: string; trainer_id: string
          slot_id: string | null; service_type: string; date: string; time: string
          duration: number
          status: 'booked' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; studio_id: string; student_id: string; trainer_id: string
          slot_id?: string | null; service_type: string; date: string; time: string
          duration?: number
          status?: 'booked' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
        }
        Update: {
          student_id?: string; trainer_id?: string; service_type?: string
          date?: string; time?: string; duration?: number
          status?: 'booked' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
        }
        Relationships: []
      }
      schedule_slots: {
        Row: {
          id: string; studio_id: string; trainer_id: string; name: string
          description: string | null; type: string; day_of_week: number
          start_time: string; end_time: string; duration: number
          max_students: number; price: number | null; active: boolean; created_at: string
        }
        Insert: {
          id?: string; studio_id: string; trainer_id: string; name: string
          description?: string | null; type: string; day_of_week: number
          start_time: string; end_time: string; duration?: number
          max_students?: number; price?: number | null; active?: boolean
        }
        Update: {
          name?: string; description?: string | null; type?: string
          start_time?: string; end_time?: string; duration?: number
          max_students?: number; price?: number | null; active?: boolean
        }
        Relationships: []
      }
      checkins: {
        Row: {
          id: string; studio_id: string; student_id: string; appointment_id: string | null
          method: 'qr' | 'pin' | 'manual' | 'facial'; coins_earned: number
          level_before: string; level_after: string; checked_in_at: string
        }
        Insert: {
          id?: string; studio_id: string; student_id: string; appointment_id?: string | null
          method?: 'qr' | 'pin' | 'manual' | 'facial'; coins_earned?: number
          level_before?: string; level_after?: string; checked_in_at?: string
        }
        Update: { method?: 'qr' | 'pin' | 'manual' | 'facial' }
        Relationships: []
      }
      qr_tokens: {
        Row: {
          id: string; student_id: string; studio_id: string; token: string
          expires_at: string; used: boolean; created_at: string
        }
        Insert: {
          id?: string; student_id: string; studio_id: string; token: string
          expires_at: string; used?: boolean
        }
        Update: { used?: boolean; expires_at?: string }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          id: string; studio_id: string; student_id: string; amount: number
          type: string; description: string; reference_id: string | null; created_at: string
        }
        Insert: {
          id?: string; studio_id: string; student_id: string; amount: number
          type: string; description: string; reference_id?: string | null
        }
        Update: { description?: string }
        Relationships: []
      }
      rewards: {
        Row: {
          id: string; studio_id: string; name: string; description: string | null
          emoji: string | null; coins_cost: number; stock_quantity: number | null
          claimed_count: number; is_active: boolean; expires_at: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; studio_id: string; name: string; description?: string | null
          emoji?: string | null; coins_cost: number; stock_quantity?: number | null
          claimed_count?: number; is_active?: boolean; expires_at?: string | null
        }
        Update: {
          name?: string; description?: string | null; emoji?: string | null
          coins_cost?: number; stock_quantity?: number | null
          claimed_count?: number; is_active?: boolean; expires_at?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          id: string; studio_id: string; student_id: string; reward_id: string
          coins_spent: number; status: string; redeemed_at: string
        }
        Insert: {
          id?: string; studio_id: string; student_id: string; reward_id: string
          coins_spent: number; status?: string
        }
        Update: { status?: string }
        Relationships: []
      }
      monthly_rankings: {
        Row: {
          id: string; studio_id: string; student_id: string; year: number; month: number
          checkins: number; coins_earned: number; rank: number; awarded: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; studio_id: string; student_id: string; year: number; month: number
          checkins?: number; coins_earned?: number; rank?: number; awarded?: boolean
        }
        Update: { checkins?: number; coins_earned?: number; rank?: number; awarded?: boolean }
        Relationships: []
      }
      student_payments: {
        Row: {
          id: string; studio_id: string; student_id: string; amount: number
          due_date: string; paid_at: string | null
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method: string | null; notes: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; studio_id: string; student_id: string; amount: number
          due_date: string; paid_at?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method?: string | null; notes?: string | null
        }
        Update: {
          amount?: number; due_date?: string; paid_at?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method?: string | null; notes?: string | null
        }
        Relationships: []
      }
      studio_billing: {
        Row: {
          id: string; studio_id: string; stripe_invoice_id: string | null
          amount: number; status: string; paid_at: string | null
          period_start: string | null; period_end: string | null; created_at: string
        }
        Insert: {
          id?: string; studio_id: string; stripe_invoice_id?: string | null
          amount: number; status?: string; paid_at?: string | null
          period_start?: string | null; period_end?: string | null
        }
        Update: { status?: string; paid_at?: string | null }
        Relationships: []
      }
      notification_templates: {
        Row: {
          id: string; studio_id: string; name: string; trigger: string
          channel: string; template: string; active: boolean; created_at: string
        }
        Insert: {
          id?: string; studio_id: string; name: string; trigger: string
          channel: string; template: string; active?: boolean
        }
        Update: {
          name?: string; trigger?: string; channel?: string; template?: string; active?: boolean
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: string; studio_id: string; student_id: string; template_id: string | null
          channel: string; message: string; status: string; external_id: string | null
          created_at: string
        }
        Insert: {
          id?: string; studio_id: string; student_id: string; template_id?: string | null
          channel: string; message: string; status?: string; external_id?: string | null
        }
        Update: { status?: string; external_id?: string | null }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      process_checkin: {
        Args: {
          p_student_id: string; p_studio_id: string
          p_method?: string; p_appointment_id?: string | null
        }
        Returns: Json
      }
      redeem_reward: {
        Args: { p_student_id: string; p_reward_id: string }
        Returns: Json
      }
      reset_monthly_checkins: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      establishment_type: 'personal' | 'studio' | 'micro_gym' | 'pilates' | 'crossfit' | 'yoga'
      student_status: 'active' | 'inactive' | 'overdue' | 'suspended'
      appointment_status: 'booked' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
      subscription_plan: 'trial' | 'starter' | 'pro' | 'enterprise'
      notification_channel: 'whatsapp' | 'email' | 'push' | 'sms'
    }
  }
}

// ── Convenience type aliases ─────────────────────────────────
type T = Database['public']['Tables']

export type Studio = T['studios']['Row']
export type Profile = T['profiles']['Row']
export type Student = T['students']['Row']
export type Trainer = T['trainers']['Row']
export type Appointment = T['appointments']['Row']
export type ScheduleSlot = T['schedule_slots']['Row']
export type Checkin = T['checkins']['Row']
export type QrToken = T['qr_tokens']['Row']
export type CoinTransaction = T['coin_transactions']['Row']
export type Reward = T['rewards']['Row']
export type RewardRedemption = T['reward_redemptions']['Row']
export type MonthlyRanking = T['monthly_rankings']['Row']
export type StudentPayment = T['student_payments']['Row']
export type StudioBilling = T['studio_billing']['Row']
export type NotificationLog = T['notification_logs']['Row']
