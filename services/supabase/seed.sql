-- Insert categories
begin;
insert into public.categories (name, color) values
  ('Education', '#4A90E2'),
  ('Healthcare', '#27AE60'),
  ('Environment & Sustainability', '#7CB342'),
  ('Social Justice & Human Rights', '#E53935'),
  ('Arts & Culture', '#9B59B6'),
  ('Poverty Alleviation & Economic Development', '#F5A623'),
  ('Disaster Relief & Humanitarian Aid', '#FF5252'),
  ('Technology & Innovation', '#00BCD4'),
  ('Animal Welfare', '#FF7043'),
  ('Public Infrastructure & Transportation', '#607D8B'),
  ('Community & Civic Engagement', '#FFCA28'),
  ('Mental Health & Well-being', '#8BC34A')
on conflict (name) do nothing;
commit;

-- Create sample user
insert into auth.users (id, email, encrypted_password)
values ('00000000-0000-0000-0000-000000000001', 'demo@example.com', '')
on conflict (id) do nothing;

-- Insert projects
insert into public.projects (
  title, description, current_amount, target_amount,
  min_investment, percentage_complete, investors_count,
  category_id, image_url, owner_id
)
values
  ('Empowering Education', 'Support education programs for children in low-income areas. Together, we can bridge the education gap and create opportunities for a brighter future.', 40000, 55000, 10, 73, 40, (select id from categories where name = 'Education'), 'https://www.youscience.com/wp-content/uploads/2024/08/Images_Artboard-179.jpg', '00000000-0000-0000-0000-000000000001'),
  ('Forest Restoration Initiative', 'Restore and reforest areas devastated by uncontrolled deforestation. Your support helps rebuild ecosystems and fight climate change.', 54000, 60000, 10, 90, 35, (select id from categories where name = 'Environment & Sustainability'), 'https://www.tn8.tv/wp-content/uploads/2021/04/archi.jpg', '00000000-0000-0000-0000-000000000001'),
  ('Universal Health Access', 'Provide basic health services, vaccinations, and medical support to underserved rural populations.', 20000, 40000, 15, 50, 25, (select id from categories where name = 'Healthcare'), 'https://pbs.twimg.com/media/F35gAUjWcAAzdS5.jpg', '00000000-0000-0000-0000-000000000001'),
  ('Clean Water for Life', 'Install clean water systems and filtration technologies in remote villages lacking access to potable water.', 25000, 50000, 20, 50, 30, (select id from categories where name = 'Poverty Alleviation & Economic Development'), 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Humanitarian_aid_OCPA-2005-10-28-090517a.jpg/1024px-Humanitarian_aid_OCPA-2005-10-28-090517a.jpg', '00000000-0000-0000-0000-000000000001'),
  ('Animal Rescue Network', 'Establish a rescue network for stray and injured animals, providing medical care and adoption support.', 15000, 30000, 5, 50, 15, (select id from categories where name = 'Animal Welfare'), 'https://external-preview.redd.it/l6hyiag76Q4p61JVreFDf_Fpvf9vqa3Rsx7Gu-rujFI.jpg?width=640&crop=smart&auto=webp&s=68aa7e8853d44e5e5b59bfc452a21ad75e6024a0', '00000000-0000-0000-0000-000000000001'),
  ('Mindful Support', 'Develop and distribute an easy-to-use mobile app that provides resources, exercises, and mental health support to young adults.', 10000, 25000, 2, 40, 20, (select id from categories where name = 'Mental Health & Well-being'), 'https://i.ytimg.com/vi/HljBbEN8rV0/maxresdefault.jpg', '00000000-0000-0000-0000-000000000001'),
  ('Artists for Social Impact', 'Fund artistic initiatives that highlight social justice, encourage civic engagement, and spark policy changes.', 8000, 15000, 1, 53, 12, (select id from categories where name = 'Arts & Culture'), 'https://live.staticflickr.com/4880/45400393985_3b7af4e5e2_c.jpg', '00000000-0000-0000-0000-000000000001'),
  ('Code the Future', 'Deliver coding and digital literacy training for high school students in low-resource communities.', 30000, 40000, 12, 75, 28, (select id from categories where name = 'Technology & Innovation'), 'https://kidsintech.org/wp-content/uploads/2022/10/c62fde_f3bca409e21f41088c615b0d46b27e6emv2.webp', '00000000-0000-0000-0000-000000000001'),
  ('Emergency Response Fund', 'Deliver essential supplies, shelter, and food to communities affected by floods, earthquakes, and other disasters.', 45000, 70000, 25, 64, 33, (select id from categories where name = 'Disaster Relief & Humanitarian Aid'), 'https://s32943.pcdn.co/wp-content/uploads/2024/01/NEP_2015_05_04_jo_nepal_1015.jpg', '00000000-0000-0000-0000-000000000001'),
  ('Civic Leadership Lab', 'Train young leaders in community organizing, policy advocacy, and civic education to promote democratic values.', 12000, 30000, 7, 40, 19, (select id from categories where name = 'Community & Civic Engagement'), 'https://cdn.prod.website-files.com/660e658d0cfb31720d8934d0/6709460ae275550703bcc2a2_66bb7accc2fa2f21061c37b9_crowdfunding-demographic.webp', '00000000-0000-0000-0000-000000000001');

-- Insert tags
insert into public.project_tags (name, color)
values
  ('education', '#4A90E2'),
  ('children', '#F39C12'),
  ('environment', '#27AE60'),
  ('sustainable', '#16A085'),
  ('mental-health', '#9B59B6'),
  ('tech', '#00BCD4'),
  ('water', '#3498DB'),
  ('rescue', '#E74C3C'),
  ('adoption', '#FF9F43'),
  ('emergency', '#C0392B'),
  ('civic', '#F1C40F'),
  ('justice', '#8E44AD'),
  ('healing', '#2ECC71'),
  ('arts', '#9B59B6'),
  ('leadership', '#2980B9'),
  ('healthcare', '#1ABC9C'),
  ('innovation', '#00BCD4'),
  ('future', '#2C3E50'),
  ('support', '#D35400'),
  ('development', '#F39C12');

-- Link tags to projects
insert into public.project_tag_relationships (project_id, tag_id)
select p.id, t.id
from public.projects p
join public.project_tags t on
  (p.title = 'Empowering Education' and t.name in ('education', 'children', 'future')) or
  (p.title = 'Forest Restoration Initiative' and t.name in ('environment', 'sustainable')) or
  (p.title = 'Universal Health Access' and t.name in ('healthcare', 'support')) or
  (p.title = 'Clean Water for Life' and t.name in ('water', 'development')) or
  (p.title = 'Animal Rescue Network' and t.name in ('rescue', 'adoption')) or
  (p.title = 'Mindful Support' and t.name in ('mental-health', 'healing')) or
  (p.title = 'Artists for Social Impact' and t.name in ('arts', 'justice')) or
  (p.title = 'Code the Future' and t.name in ('tech', 'innovation')) or
  (p.title = 'Emergency Response Fund' and t.name in ('emergency', 'support')) or
  (p.title = 'Civic Leadership Lab' and t.name in ('civic', 'leadership'));
