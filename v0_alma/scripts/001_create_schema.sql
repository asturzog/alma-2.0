-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create markets table
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('EPL', 'AFCON')),
  liquidity DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved')),
  winning_outcome_id UUID,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create outcomes table
CREATE TABLE IF NOT EXISTS public.outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  outcome_id UUID NOT NULL REFERENCES public.outcomes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  shares DECIMAL(10, 4) NOT NULL,
  price DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Markets policies (everyone can view, only admins can create)
CREATE POLICY "Anyone can view active markets" ON public.markets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create markets" ON public.markets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Market creators can update their markets" ON public.markets
  FOR UPDATE USING (auth.uid() = created_by);

-- Outcomes policies
CREATE POLICY "Anyone can view outcomes" ON public.outcomes
  FOR SELECT USING (true);

CREATE POLICY "Market creators can create outcomes" ON public.outcomes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.markets 
      WHERE id = market_id AND created_by = auth.uid()
    )
  );

-- Bets policies
CREATE POLICY "Users can view all bets" ON public.bets
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own bets" ON public.bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_markets_category ON public.markets(category);
CREATE INDEX IF NOT EXISTS idx_markets_status ON public.markets(status);
CREATE INDEX IF NOT EXISTS idx_outcomes_market_id ON public.outcomes(market_id);
CREATE INDEX IF NOT EXISTS idx_bets_market_id ON public.bets(market_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_outcome_id ON public.bets(outcome_id);
