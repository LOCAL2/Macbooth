-- ==============================================================================
-- 🍎 MAC DEFENDER — SUPABASE LEADERBOARD SCHEMA
-- Script สำหรับสร้างตาราง leaderboard ใน Supabase พร้อมเปิดระบบ Realtime
-- ให้นำโค้ดนี้ไปรันใน Supabase -> SQL Editor -> New Query แล้วกด RUN
-- ==============================================================================

-- 1. สร้างตาราง leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    callsign TEXT NOT NULL,                  -- ชื่อเรียกขาน / ฉายาผู้เล่น
    nickname TEXT,                           -- ฉายาสำรอง (ถ้ามี)
    score INTEGER NOT NULL DEFAULT 0,        -- คะแนนรวม
    rank TEXT NOT NULL DEFAULT 'B',          -- ระดับ (S, A, B, C)
    time_formatted TEXT DEFAULT '05:00',     -- เวลาที่ใช้แสดงผล (เช่น 02:28)
    time_seconds INTEGER DEFAULT 300,        -- เวลาที่ใช้เป็นวินาที
    threats_blocked INTEGER DEFAULT 0,       -- จำนวนด่านหรือภัยคุกคามที่สกัดกั้นได้
    difficulty TEXT DEFAULT 'normal',        -- ระดับความยาก (easy, normal, nightmare)
    completed_at TIMESTAMPTZ DEFAULT now()   -- วันเวลาที่เล่นเสร็จ
);

-- 2. สร้าง Index สำหรับการจัดอันดับและค้นหาคะแนนสูงสุด
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON public.leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON public.leaderboard (difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_completed_at ON public.leaderboard (completed_at DESC);

-- 3. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 4. ตั้งค่านโยบาย (Policies) เพื่อให้ Frontend (anon key) สามารถอ่านและเพิ่มคะแนนได้
DROP POLICY IF EXISTS "Allow public read leaderboard" ON public.leaderboard;
CREATE POLICY "Allow public read leaderboard"
    ON public.leaderboard
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert leaderboard" ON public.leaderboard;
CREATE POLICY "Allow public insert leaderboard"
    ON public.leaderboard
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete leaderboard" ON public.leaderboard;
CREATE POLICY "Allow public delete leaderboard"
    ON public.leaderboard
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- 5. เปิดระบบ Realtime ให้กับตาราง leaderboard ใน Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;


