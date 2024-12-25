/*
  # Fix Profiles RLS Policies

  1. Changes
    - Add INSERT policy for profiles table to allow users to create their initial profile

  2. Security
    - Users can only create their own profile (id must match auth.uid())
    - Maintains existing policies for SELECT and UPDATE
*/

CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);