-- Allow deleting customers, passes, visits, and rewards for admin management
CREATE POLICY "Anyone can delete customers" ON public.customers FOR DELETE TO public USING (true);
CREATE POLICY "Anyone can delete passes" ON public.passes FOR DELETE TO public USING (true);
CREATE POLICY "Anyone can delete visits" ON public.visits FOR DELETE TO public USING (true);
CREATE POLICY "Anyone can delete rewards" ON public.rewards FOR DELETE TO public USING (true);