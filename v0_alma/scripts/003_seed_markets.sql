-- Insert sample markets for EPL and AFCON 2025
-- Note: Replace 'YOUR_USER_ID' with an actual admin user ID after authentication is set up
-- For now, we'll create a placeholder that can be updated later

-- EPL Market: Who will win the Premier League?
DO $$
DECLARE
  market_id UUID;
  admin_id UUID;
BEGIN
  -- Get the first user as admin (you can change this logic)
  SELECT id INTO admin_id FROM auth.users LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.markets (id, title, description, category, liquidity, created_by)
    VALUES (
      gen_random_uuid(),
      'Who will win the Premier League 2024/25?',
      'Predict which team will be crowned Premier League champions at the end of the season.',
      'EPL',
      1000.00,
      admin_id
    )
    RETURNING id INTO market_id;

    -- Insert outcomes for EPL
    INSERT INTO public.outcomes (market_id, title, quantity) VALUES
      (market_id, 'Manchester City', 50.00),
      (market_id, 'Arsenal', 40.00),
      (market_id, 'Liverpool', 30.00),
      (market_id, 'Chelsea', 20.00),
      (market_id, 'Manchester United', 15.00);
  END IF;
END $$;

-- AFCON Market: Who will win AFCON 2025?
DO $$
DECLARE
  market_id UUID;
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.markets (id, title, description, category, liquidity, created_by)
    VALUES (
      gen_random_uuid(),
      'Who will win AFCON 2025?',
      'Predict the winner of the Africa Cup of Nations 2025 tournament.',
      'AFCON',
      1000.00,
      admin_id
    )
    RETURNING id INTO market_id;

    -- Insert outcomes for AFCON
    INSERT INTO public.outcomes (market_id, title, quantity) VALUES
      (market_id, 'Nigeria', 45.00),
      (market_id, 'Senegal', 40.00),
      (market_id, 'Egypt', 35.00),
      (market_id, 'Morocco', 30.00),
      (market_id, 'Ivory Coast', 25.00),
      (market_id, 'Ghana', 20.00);
  END IF;
END $$;
