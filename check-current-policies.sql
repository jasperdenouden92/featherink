-- Check Current RLS Policies on Stories Table
-- Run this to see what policies actually exist

-- Check all policies on stories table
SELECT 
    policyname,
    cmd as operation,
    roles,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'stories'
ORDER BY cmd, policyname;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'stories';

-- Check for any conflicting policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'stories'
ORDER BY policyname;
