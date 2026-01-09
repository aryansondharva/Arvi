-- Seed initial achievements
INSERT INTO achievements (name, description, icon, criteria_type, criteria_value, badge_tier) VALUES
('First Steps', 'Attend your first cleanup event', '🌱', 'events_attended', 1, 'bronze'),
('Getting Started', 'Attend 5 cleanup events', '🌿', 'events_attended', 5, 'bronze'),
('Regular Volunteer', 'Attend 10 cleanup events', '🌳', 'events_attended', 10, 'silver'),
('Dedicated Volunteer', 'Attend 25 cleanup events', '🏆', 'events_attended', 25, 'gold'),
('Eco Champion', 'Attend 50 cleanup events', '👑', 'events_attended', 50, 'platinum'),

('Waste Warrior', 'Collect 10kg of waste', '♻️', 'waste_collected', 10, 'bronze'),
('Clean Sweep', 'Collect 50kg of waste', '🧹', 'waste_collected', 50, 'silver'),
('Cleanup Hero', 'Collect 100kg of waste', '💪', 'waste_collected', 100, 'gold'),
('Waste Master', 'Collect 500kg of waste', '🌟', 'waste_collected', 500, 'platinum'),

('Tree Planter', 'Plant 5 trees', '🌲', 'trees_planted', 5, 'bronze'),
('Forest Builder', 'Plant 25 trees', '🌴', 'trees_planted', 25, 'silver'),
('Green Thumb', 'Plant 50 trees', '🌳', 'trees_planted', 50, 'gold'),
('Reforestation Expert', 'Plant 100 trees', '🌲', 'trees_planted', 100, 'platinum'),

('One Week Streak', 'Attend events for 7 consecutive days', '🔥', 'streak_days', 7, 'bronze'),
('One Month Streak', 'Attend events for 30 consecutive days', '🔥', 'streak_days', 30, 'silver'),
('Three Month Streak', 'Attend events for 90 consecutive days', '🔥', 'streak_days', 90, 'gold')
ON CONFLICT (name) DO NOTHING;
