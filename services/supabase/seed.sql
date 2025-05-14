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

-- Insert project pitch
insert into public.project_pitch (project_id, title, story, pitch_deck, video_url)
values
  ((select id from public.projects where title = 'Empowering Education'),
   'Empowering Education: Equal Opportunity for All',
   $$Our mission is to bridge the education gap in low-income communities by providing quality educational resources, technology, and mentorship programs.

## The Problem

In many underserved communities, schools lack basic resources, qualified teachers, and modern technology. This creates a cycle of educational inequality that affects generations.

## Our Solution

We're implementing a three-pronged approach:

1. **Resource Distribution**: Providing books, supplies, and learning materials to schools in need.
2. **Technology Access**: Setting up computer labs and internet connectivity in schools.
3. **Mentorship Programs**: Connecting students with professionals who can guide their educational journey.

## Impact

With your support, we aim to reach 50 schools and impact over 10,000 students in the first year. Each investment directly contributes to a child's future.

Join us in creating a world where every child has access to quality education.$$,
   'http://127.0.0.1:54321/storage/v1/object/sign/project_pitch_decks/empowering-education.pdf',
   'https://www.youtube.com/embed/dwPxCzH0RrU'
  ),

  ((select id from public.projects where title = 'Forest Restoration Initiative'),
  'Forest Restoration Initiative: Healing Earth One Tree at a Time',
  $$Our mission is to restore ecosystems, fight climate change, and bring life back to deforested regions through large-scale reforestation led by local communities.

  ## The Crisis

  Deforestation has wiped out millions of hectares of forests globally. This leads to habitat loss, carbon emissions, soil degradation, and declining biodiversity. Communities living near these areas also suffer economically and socially from the environmental damage.

  ## Our Mission

  The Forest Restoration Initiative aims to:

  1. **Plant Native Trees**: We focus on biodiversity by planting species that belong to the region.
  2. **Engage Local Communities**: We create sustainable jobs in seed collection, planting, and forest maintenance.
  3. **Monitor & Maintain**: Using drone tech and local training, we track tree survival and ensure long-term growth.

  ## Local Impact

  - Over 500 local jobs created
  - 2.5 million trees to be planted over 24 months
  - Improved air quality, carbon offsetting, and flood mitigation

  ## Global Benefit

  This is more than planting trees — it’s a fight for climate stability, food security, and clean water. Supporting this project helps restore the lungs of our planet and ensures a livable future for all.

  Let’s reforest together, one tree at a time.
  $$,
  'http://127.0.0.1:54321/storage/v1/object/sign/project_pitch_decks/forest-restoration.pdf',
  'https://www.youtube.com/embed/vzJmYDw4i54'
  ),

  ((select id from public.projects where title = 'Universal Health Access'),
  'Universal Health Access: Healthcare Where It’s Needed Most',
  $$Billions of people around the world still lack access to basic healthcare. Our initiative is focused on bridging that gap by delivering medical services, education, and support to the most vulnerable populations.

  ## The Challenge

  Remote and underserved communities often face:
  - No nearby clinics or hospitals
  - Shortages of medicines and medical staff
  - Preventable illnesses that go untreated
  - High maternal and infant mortality rates

  ## Our Approach

  We're taking a comprehensive, community-first strategy:

  1. **Mobile Clinics**: Deploying well-equipped vehicles that provide diagnostics, treatment, and vaccinations.
  2. **Health Education**: Empowering residents with knowledge on hygiene, nutrition, and disease prevention.
  3. **Training Local Health Workers**: Building long-term capacity by training community members to deliver care.

  ## Outcomes We Aim For

  - Serve 100,000+ individuals in the first year
  - Reduce preventable disease rates by 40%
  - Train 300 local health workers
  - Establish 10 permanent community health hubs

  ## Why It Matters

  Healthcare is a basic human right - not a privilege. With your support, we can close the health gap and provide life-saving services to those who’ve been left behind.

  Help us bring health to all. Every contribution funds a real, lasting impact.$$,
 'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/universal-health.pdf',
 'https://www.youtube.com/embed/7hLec5EU7jM'),

  ((select id from public.projects where title = 'Clean Water for Life'),
 'Clean Water for Life: A Mission for Health and Sustainability',
  $$Access to clean and safe drinking water is essential to human survival, yet millions still live without it. We aim to change that by bringing purification technology and education to the communities that need it most.

  ## Why Water?

  Lack of clean water leads to:
  - Waterborne illnesses like cholera and typhoid
  - Missed education for children, especially girls
  - High child mortality rates
  - Limited economic opportunities

  ## What We're Doing

  Our multi-level approach includes:
  1. **Water Filtration Installations**: Providing villages with durable, solar-powered water filtration systems.
  2. **Community Training**: Teaching locals how to maintain systems and practice safe water handling.
  3. **Monitoring & Impact Tracking**: Ensuring long-term results through regular assessments.

  ## Expected Outcomes

  - Provide clean water access to 50,000 people in the first phase
  - Reduce child mortality due to waterborne diseases by 60%
  - Improve school attendance rates
  - Train 100+ local water stewards

  ## You Can Make a Difference

  Every dollar supports the infrastructure, training, and education needed to make clean water a permanent reality for vulnerable populations.

  **Join us in building a healthier, more equitable world—one drop at a time.**$$,
 'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/clean-water.pdf',
 'https://www.youtube.com/embed/BjlvORU8cfI'),

  ((select id from public.projects where title = 'Animal Rescue Network'),
  'Every Animal Deserves a Chance',
  $$Every year, millions of animals suffer abandonment, abuse, or injury. Our mission is to build a compassionate safety net that ensures every animal receives the care, love, and opportunity they deserve.

  ## The Problem

  - Countless stray animals live without food, shelter, or medical care.
  - Underfunded shelters are overcrowded and under-resourced.
  - Public awareness and education around animal welfare are still limited.

  ## Our Response

  We’ve designed a community-driven network to provide:

  1. **Rapid Response Rescue Units**: Trained volunteers respond to reports of injured or stray animals.
  2. **Medical Support & Rehabilitation**: All rescued animals receive vet care, vaccinations, and rehabilitation before adoption.
  3. **Adoption & Foster Programs**: Matching animals with loving homes through outreach and community events.
  4. **Public Education Campaigns**: Promoting responsible pet ownership, spay/neuter programs, and kindness toward animals.

  ## What We Hope to Achieve

  - Rescue and rehabilitate over 5,000 animals in the first year
  - Build partnerships with 100+ local shelters and clinics
  - Launch a mobile adoption unit to reach rural communities
  - Host 200+ education sessions in schools and community centers

  ## Why It Matters

  Animals feel, suffer, and love just as we do. By acting now, we can change their lives — and ours. Help us build a future where no animal is forgotten or left behind.

  Together, we can give them the second chance they deserve.
  $$,
  'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/animal-rescue.pdf',
  'https://www.youtube.com/embed/3bOMIZzoBik'),

  ((select id from public.projects where title = 'Mindful Support'),
 'Mental Health in Your Pocket',
  $$Mental health challenges among youth are rising at an alarming rate. Our project aims to meet them where they are—on their phones—with a supportive, accessible, and stigma-free solution.

  ## The Issue

  Young people often face:

  - Anxiety, depression, and stress without proper tools to manage them
  - Limited or no access to therapy or support services
  - Social stigma that prevents them from asking for help
  - Overwhelmed school systems unable to provide mental health education

  ## Our Solution

  We’re creating a mobile app that empowers users with:

  1. **Guided Mindfulness Exercises**: Breathing, grounding, and stress-reduction techniques.
  2. **Educational Content**: Age-appropriate resources on mental health and self-care.
  3. **Crisis Tools**: Quick-access resources for users experiencing acute distress.
  4. **Chat Support with Trained Counselors**: A safe space to talk, ask questions, and feel heard.

  ## Our Goals

  - Reach 1 million users in the first 18 months
  - Partner with 500 schools to integrate the app into their student wellness initiatives
  - Offer free premium access to youth in low-income communities

  ## Why It Matters

  Mental well-being is foundational to every aspect of life. When young people have the right tools, they thrive—not just survive. Your support brings help and hope to youth around the world.

  Together, we can normalize mental health care and make support available 24/7—from the palm of your hand.
  $$,
  'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/mindful-support.pdf',
  'https://www.youtube.com/embed/vzKryaN44ss'),
  
  ((select id from public.projects where title = 'Artists for Social Impact'),
  'Art That Inspires Change: Artists for Social Impact',
  $$Art has always had the power to move hearts, shift perspectives, and ignite revolutions. Through this initiative, we aim to support artists who are using their creative gifts to advocate for justice and drive positive social transformation.

  ## Why Art Matters in Social Change

  Across history, art has served as a powerful lens on society's triumphs and struggles. Today, artists continue to:

  - Amplify marginalized voices
  - Challenge unjust systems through symbolism and storytelling
  - Unite communities through shared cultural expression
  - Inspire dialogue and civic participation

  ## Our Vision

  We believe creativity can be a catalyst for a more equitable world. This project will:

  1. **Fund Community-Based Art Projects**: Murals, performances, and exhibitions rooted in local struggles and dreams.
  2. **Support Artist Residencies**: Provide resources and mentorship for emerging artists tackling social issues.
  3. **Launch Traveling Exhibits**: Take stories of justice, healing, and empowerment on the road—reaching schools, libraries, and public spaces.
  4. **Create a Digital Archive**: Document the voices and visuals of a movement for future generations.

  ## Expected Impact

  - Empower 500+ artists from underrepresented backgrounds
  - Reach over 1 million viewers through live and online exhibits
  - Drive awareness around critical social issues like equity, inclusion, and justice

  ## Join the Movement

  When you support art, you support imagination, resilience, and hope. Let's back those who speak truth through color, rhythm, and form.

  Together, we can turn creativity into lasting impact.$$,
    'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/artists-for-social-impact.pdf',
    'https://www.youtube.com/embed/u9UO2srZ-G8'
  ),

  ((select id from public.projects where title = 'Code the Future'),
  'Coding for a Brighter Tomorrow: Code the Future',
  $$Technology is reshaping the world—and yet, millions of young people lack access to the digital skills that drive modern careers. Our mission is to bridge the digital divide by empowering students with technical education and real-world mentorship.

  ## The Digital Divide

  Too many students in low-income communities face:
  - Outdated or nonexistent computer labs
  - No exposure to programming or digital skills
  - Limited role models working in tech
  - Missed opportunities for future employment

  ## Our Program

  We're equipping youth with the skills of tomorrow:

  1. **Intro to Coding Bootcamps**: Hands-on sessions introducing Python, JavaScript, and web development.
  2. **Mentorship from Professionals**: Weekly mentoring from software engineers, designers, and data scientists.
  3. **Hackathons & Challenges**: Events to build real-world projects and inspire confidence.
  4. **Career Pathways**: Guidance on internships, university tracks, and certifications.

  ## Projected Impact

  - **2,000+ students** trained in the first year
  - **60% increase** in STEM interest among participants
  - **400 volunteer mentors** engaged
  - **15 regional tech hubs** launched in underserved schools

  ## Why It Matters

  Digital literacy is no longer optional—it’s essential. Together, we can ensure every young person, regardless of background, is prepared to thrive in a technology-driven future.

  **Code the Future starts now. Let’s build it together.**$$,
    'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/code-the-future.pdf',
    'https://www.youtube.com/embed/X2BQmRZw8RY'
  ),

  ((select id from public.projects where title = 'Emergency Response Fund'),
  'Rapid Relief for Crisis Areas: Emergency Response Fund',
  $$ Natural disasters leave communities devastated—often without warning. Our Emergency Response Fund is designed to deliver fast, coordinated, and effective humanitarian aid when it's needed most.

  ## Crisis Realities

  In the aftermath of hurricanes, earthquakes, floods, and wildfires, survivors face:

  - Lack of food and clean water  
  - Displacement from homes and shelters  
  - Inadequate medical attention and hygiene supplies  
  - Disruption of communication and infrastructure  

  ## Our Relief Strategy

  We act quickly, with impact-driven priorities:

  1. **Rapid Deployment Teams**: On-the-ground volunteers and logistics specialists ready to mobilize.  
  2. **Essential Supplies**: Distribution of food, water, blankets, and emergency kits within 24 hours.  
  3. **Shelter & Safety**: Temporary housing solutions with sanitation and security protocols.  
  4. **Coordination with Local Leaders**: Ensuring culturally appropriate, community-driven interventions.  

  ## What We Aim to Achieve

  - Aid delivery to **over 50,000** affected individuals per disaster event  
  - Reduce emergency response time to **under 12 hours**  
  - Establish a pre-stocked network of **10 regional warehouses**  
  - Train **1,000 volunteers** in crisis logistics and trauma support  

  ## Why You Matter

  Disaster can strike anyone. With your support, we ensure that no family is left to fend for themselves during their most difficult hour.

  **Be the lifeline. Contribute to emergency readiness and resilience.**$$,
    'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/emergency-response.pdf',
    'hhttps://www.youtube.com/embed/BQowGrO_5lQ'
  ),

  ((select id from public.projects where title = 'Civic Leadership Lab'),
 'Youth Leaders for Tomorrow: Empowering Civic Changemakers',
  $$Our initiative focuses on identifying, training, and mentoring the next generation of civic leaders in underserved communities. These young individuals are the key to creating lasting systemic change from the ground up.

  ## Why Leadership Matters

  Many communities face challenges like political apathy, limited access to civic education, and disengagement from democratic processes. By equipping youth with the tools to organize, advocate, and lead, we unlock their power to:

  - Promote transparency and accountability
  - Build grassroots movements
  - Influence policy decisions
  - Mobilize communities for positive action

  ## Our Program Includes

  1. **Leadership Bootcamps**: Immersive workshops focused on advocacy, communication, and organizing.
  2. **Mentorship Networks**: Pairing youth with experienced civic leaders and policy experts.
  3. **Micro-Grants for Projects**: Supporting youth-led initiatives in their own communities.
  4. **Policy Simulation Labs**: Offering experiential learning in real-world civic challenges.

  ## Our Impact Goals

  - Reach 500+ youth in 2 years
  - Launch 100+ community impact projects
  - Improve local civic participation rates by 25%
  - Create a replicable model of civic leadership training

  ## Why Now

  The future of democracy depends on informed and empowered citizens. Our mission is to cultivate visionary leaders who understand their communities and are equipped to make change happen.

  Invest in the leaders of tomorrow—because democracy thrives when youth rise.$$,
  'http://127.0.0.1:54321/storage/v1/object/public/project_pitch_decks/civic-leadership.pdf',
  'https://www.youtube.com/embed/w38Saswmfdc'
  );

-- Insert users
insert into auth.users (id, email, encrypted_password) values
  ('fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'nina.martinez@example.com', ''),
  ('c124b016-bab9-4904-8e1a-c38b8623001b', 'ximena.thompson@example.com', ''),
  ('44e69d1d-2659-4a51-82ce-487e8c9ef320', 'diego.gonzalez@example.com', ''),
  ('08bf1aed-8822-4d99-84ae-f89fcf46624a', 'diego.jackson@example.com', ''),
  ('bcc18c37-3a33-4585-9af0-0e163cbb3850', 'isabel.wright@example.com', ''),
  ('5af02f63-3be5-44e4-bd3a-0964b1dc8e39', 'diana.white@example.com', ''),
  ('2c8a13a2-0a76-4758-84bd-12a633cf598c', 'grace.taylor@example.com', ''),
  ('0876de6c-f9ad-4ba2-b4a3-725ddbb8d498', 'maria.martin@example.com', ''),
  ('ba754a4b-c267-4d70-8c1a-00154f9b1cf1', 'karen.allen@example.com', ''),
  ('eee0c1ac-86c6-4024-a5e3-c5f350626b6a', 'frank.thomas@example.com', ''),
  ('8f665ffb-d1bf-43da-90b6-1f2bb88d91ca', 'tina.king@example.com', ''),
  ('31738359-04ef-418d-a6e5-59e9de312dab', 'bob.thompson@example.com', ''),
  ('fec8063f-59a9-4e66-a6c8-c9f5c4a57353', 'john.gonzalez@example.com', ''),
  ('8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', 'zoe.martinez@example.com', ''),
  ('1616f605-613d-49d8-b933-efad3fbc688c', 'samuel.scott@example.com', ''),
  ('e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', 'wendy.davis@example.com', ''),
  ('8e05ed73-6be8-4e23-bd02-3a8344cef8d4', 'oscar.thompson@example.com', ''),
  ('e52ed5c4-722d-4380-853e-7530db295722', 'maria.moore@example.com', ''),
  ('51fdcab5-7789-429d-bb3b-844139921e84', 'oscar.wright@example.com', ''),
  ('55499a3c-f7d8-492b-a790-4223f29467b1', 'bob.martin@example.com', ''),
  ('b5780351-aba6-459e-8d41-3fbd3a5018bf', 'tina.lopez@example.com', ''),
  ('ff517450-e235-477e-a058-a2a73608dd69', 'nina.thompson@example.com', ''),
  ('f51272df-fd8f-4826-adf8-58aa6378cb32', 'paula.clark@example.com', ''),
  ('bc6176d7-72c0-4b4c-b2b5-44cde3438517', 'carlos.perez@example.com', ''),
  ('1609aba1-bcbb-426b-ae57-456f02e16de7', 'yuri.lopez@example.com', ''),
  ('8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', 'diego.taylor@example.com', ''),
  ('ad549c42-5906-41a8-a08f-5d810e01d2eb', 'alice.lopez@example.com', ''),
  ('2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', 'zoe.perez@example.com', ''),
  ('81d3ff4d-b5de-42e7-a53d-26f275fe7668', 'frank.hall@example.com', '');

-- Insert profiles for all users
insert into public.profiles (id, role, display_name, bio, image_url) values
  ('fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'kinder', 'Nina Martinez', 'Empowering youth with mindfulness tools and support.', 'https://randomuser.me/api/portraits/women/1.jpg'),
  ('c124b016-bab9-4904-8e1a-c38b8623001b', 'kinder', 'Ximena Thompson', 'Mobilizing rapid aid to disaster-affected communities worldwide.', 'https://randomuser.me/api/portraits/women/2.jpg'),
  ('44e69d1d-2659-4a51-82ce-487e8c9ef320', 'kinder', 'Diego Gonzalez', 'Focused on bringing clean water to every corner of the world.', 'https://randomuser.me/api/portraits/men/1.jpg'),
  ('08bf1aed-8822-4d99-84ae-f89fcf46624a', 'kinder', 'Diego Jackson', 'Mobilizing rapid aid to disaster-affected communities worldwide.', 'https://randomuser.me/api/portraits/men/2.jpg'),
  ('bcc18c37-3a33-4585-9af0-0e163cbb3850', 'kinder', 'Isabel Wright', 'Teaching coding and digital skills to the next generation of innovators.', 'https://randomuser.me/api/portraits/women/3.jpg'),
  ('5af02f63-3be5-44e4-bd3a-0964b1dc8e39', 'kinder', 'Diana White', 'Rescuing and rehabilitating animals in need with love and care.', 'https://randomuser.me/api/portraits/women/4.jpg'),
  ('2c8a13a2-0a76-4758-84bd-12a633cf598c', 'kinder', 'Grace Taylor', 'Creating art that reflects social change and community empowerment.', 'https://randomuser.me/api/portraits/women/5.jpg'),
  ('0876de6c-f9ad-4ba2-b4a3-725ddbb8d498', 'kinder', 'Maria Martin', 'Rescuing and rehabilitating animals in need with love and care.', 'https://randomuser.me/api/portraits/women/6.jpg'),
  ('ba754a4b-c267-4d70-8c1a-00154f9b1cf1', 'kinder', 'Karen Allen', 'Training young leaders to advocate for change and justice.', 'https://randomuser.me/api/portraits/women/7.jpg'),
  ('eee0c1ac-86c6-4024-a5e3-c5f350626b6a', 'kinder', 'Frank Thomas', 'Rescuing and rehabilitating animals in need with love and care.', 'https://randomuser.me/api/portraits/men/3.jpg'),
  ('8f665ffb-d1bf-43da-90b6-1f2bb88d91ca', 'kinder', 'Tina King', 'Dedicated to restoring ecosystems and combating climate change.', 'https://randomuser.me/api/portraits/women/8.jpg'),
  ('31738359-04ef-418d-a6e5-59e9de312dab', 'kinder', 'Bob Thompson', 'Empowering youth with mindfulness tools and support.', 'https://randomuser.me/api/portraits/men/4.jpg'),
  ('fec8063f-59a9-4e66-a6c8-c9f5c4a57353', 'kinder', 'John Gonzalez', 'Working to ensure accessible healthcare in underserved regions.', 'https://randomuser.me/api/portraits/men/5.jpg'),
  ('8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', 'kinder', 'Zoe Martinez', 'Mobilizing rapid aid to disaster-affected communities worldwide.', 'https://randomuser.me/api/portraits/women/9.jpg'),
  ('1616f605-613d-49d8-b933-efad3fbc688c', 'kinder', 'Samuel Scott', 'Mobilizing rapid aid to disaster-affected communities worldwide.', 'https://randomuser.me/api/portraits/men/6.jpg'),
  ('e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', 'kinder', 'Wendy Davis', 'Rescuing and rehabilitating animals in need with love and care.', 'https://randomuser.me/api/portraits/women/10.jpg'),
  ('8e05ed73-6be8-4e23-bd02-3a8344cef8d4', 'kinder', 'Oscar Thompson', 'Working to ensure accessible healthcare in underserved regions.', 'https://randomuser.me/api/portraits/men/7.jpg'),
  ('e52ed5c4-722d-4380-853e-7530db295722', 'kinder', 'Maria Moore', 'Focused on bringing clean water to every corner of the world.', 'https://randomuser.me/api/portraits/women/11.jpg'),
  ('51fdcab5-7789-429d-bb3b-844139921e84', 'kinder', 'Oscar Wright', 'Focused on bringing clean water to every corner of the world.', 'https://randomuser.me/api/portraits/men/8.jpg'),
  ('55499a3c-f7d8-492b-a790-4223f29467b1', 'kinder', 'Bob Martin', 'Teaching coding and digital skills to the next generation of innovators.', 'https://randomuser.me/api/portraits/men/9.jpg'),
  ('b5780351-aba6-459e-8d41-3fbd3a5018bf', 'kinder', 'Tina Lopez', 'Teaching coding and digital skills to the next generation of innovators.', 'https://randomuser.me/api/portraits/women/12.jpg'),
  ('ff517450-e235-477e-a058-a2a73608dd69', 'kinder', 'Nina Thompson', 'Training young leaders to advocate for change and justice.', 'https://randomuser.me/api/portraits/women/13.jpg'),
  ('f51272df-fd8f-4826-adf8-58aa6378cb32', 'kinder', 'Paula Clark', 'Empowering youth with mindfulness tools and support.', 'https://randomuser.me/api/portraits/women/14.jpg'),
  ('bc6176d7-72c0-4b4c-b2b5-44cde3438517', 'kinder', 'Carlos Perez', 'Teaching coding and digital skills to the next generation of innovators.', 'https://randomuser.me/api/portraits/men/10.jpg'),
  ('1609aba1-bcbb-426b-ae57-456f02e16de7', 'kinder', 'Yuri Lopez', 'Empowering youth with mindfulness tools and support.', 'https://randomuser.me/api/portraits/women/15.jpg'),
  ('8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', 'kinder', 'Diego Taylor', 'Creating art that reflects social change and community empowerment.', 'https://randomuser.me/api/portraits/men/11.jpg'),
  ('ad549c42-5906-41a8-a08f-5d810e01d2eb', 'kinder', 'Alice Lopez', 'Mobilizing rapid aid to disaster-affected communities worldwide.', 'https://randomuser.me/api/portraits/women/16.jpg'),
  ('2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', 'kinder', 'Zoe Perez', 'Training young leaders to advocate for change and justice.', 'https://randomuser.me/api/portraits/women/17.jpg'),
  ('81d3ff4d-b5de-42e7-a53d-26f275fe7668', 'kinder', 'Frank Hall', 'Empowering youth with mindfulness tools and support.', 'https://randomuser.me/api/portraits/men/12.jpg');

-- Insert project members for each project
insert into public.project_members (project_id, user_id, role, title) values
  ((select id from public.projects where title = 'Empowering Education'), 'fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Empowering Education'), 'c124b016-bab9-4904-8e1a-c38b8623001b', 'editor', 'Education Specialist'),
  ((select id from public.projects where title = 'Empowering Education'), '44e69d1d-2659-4a51-82ce-487e8c9ef320', 'editor', 'Community Liaison'),

  ((select id from public.projects where title = 'Forest Restoration Initiative'), 'bcc18c37-3a33-4585-9af0-0e163cbb3850', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Forest Restoration Initiative'), '5af02f63-3be5-44e4-bd3a-0964b1dc8e39', 'editor', 'Field Officer'),
  ((select id from public.projects where title = 'Forest Restoration Initiative'), '2c8a13a2-0a76-4758-84bd-12a633cf598c', 'editor', 'Research Analyst'),

  ((select id from public.projects where title = 'Universal Health Access'), '0876de6c-f9ad-4ba2-b4a3-725ddbb8d498', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Universal Health Access'), 'ba754a4b-c267-4d70-8c1a-00154f9b1cf1', 'editor', 'Medical Advisor'),
  ((select id from public.projects where title = 'Universal Health Access'), 'eee0c1ac-86c6-4024-a5e3-c5f350626b6a', 'editor', 'Outreach Manager'),

  ((select id from public.projects where title = 'Clean Water for Life'), '31738359-04ef-418d-a6e5-59e9de312dab', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Clean Water for Life'), 'fec8063f-59a9-4e66-a6c8-c9f5c4a57353', 'editor', 'Sanitation Officer'),
  ((select id from public.projects where title = 'Clean Water for Life'), '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', 'editor', 'Trainer'),

  ((select id from public.projects where title = 'Animal Rescue Network'), 'e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Animal Rescue Network'), '8e05ed73-6be8-4e23-bd02-3a8344cef8d4', 'editor', 'Veterinarian'),
  ((select id from public.projects where title = 'Animal Rescue Network'), 'e52ed5c4-722d-4380-853e-7530db295722', 'editor', 'Adoption Lead'),

  ((select id from public.projects where title = 'Mindful Support'), '51fdcab5-7789-429d-bb3b-844139921e84', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Mindful Support'), '55499a3c-f7d8-492b-a790-4223f29467b1', 'editor', 'UX Designer'),
  ((select id from public.projects where title = 'Mindful Support'), 'b5780351-aba6-459e-8d41-3fbd3a5018bf', 'editor', 'Counselor'),

  ((select id from public.projects where title = 'Artists for Social Impact'), 'ff517450-e235-477e-a058-a2a73608dd69', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Artists for Social Impact'), 'f51272df-fd8f-4826-adf8-58aa6378cb32', 'editor', 'Creative Director'),
  ((select id from public.projects where title = 'Artists for Social Impact'), 'bc6176d7-72c0-4b4c-b2b5-44cde3438517', 'editor', 'Storyteller'),

  ((select id from public.projects where title = 'Code the Future'), '8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Code the Future'), 'ad549c42-5906-41a8-a08f-5d810e01d2eb', 'editor', 'Software Engineer'),
  ((select id from public.projects where title = 'Code the Future'), '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', 'editor', 'Program Manager'),

  ((select id from public.projects where title = 'Emergency Response Fund'), '1609aba1-bcbb-426b-ae57-456f02e16de7', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Emergency Response Fund'), '8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', 'editor', 'Logistics Specialist'),
  ((select id from public.projects where title = 'Emergency Response Fund'), 'ad549c42-5906-41a8-a08f-5d810e01d2eb', 'editor', 'Field Manager'),

  ((select id from public.projects where title = 'Civic Leadership Lab'), '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Civic Leadership Lab'), '81d3ff4d-b5de-42e7-a53d-26f275fe7668', 'editor', 'Policy Mentor'),
  ((select id from public.projects where title = 'Civic Leadership Lab'), '55499a3c-f7d8-492b-a790-4223f29467b1', 'editor', 'Advocacy Lead');
  
-- Insert milestones for each project
insert into public.milestones (project_id, title, description, amount, deadline, status, order_index)
values

((select id from public.projects where title = 'Empowering Education'), 'Needs Assessment', 'Conduct educational needs survey across target region.', 10000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Empowering Education'), 'Resource Development', 'Develop and print learning materials.', 20000, '2025-08-01', 'disputed', 1),
((select id from public.projects where title = 'Empowering Education'), 'Program Launch', 'Start the educational sessions with selected schools.', 20000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Forest Restoration Initiative'), 'Site Preparation', 'Clear and prepare the land for planting.', 10000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Forest Restoration Initiative'), 'Tree Planting', 'Plant native species with community volunteers.', 15000, '2025-08-01', 'completed', 1),
((select id from public.projects where title = 'Forest Restoration Initiative'), 'Monitoring and Maintenance', 'Install monitoring sensors and maintain growth.', 10000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Universal Health Access'), 'Medical Supplies Acquisition', 'Purchase essential medicine and kits.', 15000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Universal Health Access'), 'Health Camp Setup', 'Establish temporary health checkup camps.', 15000, '2025-08-01', 'pending', 1),
((select id from public.projects where title = 'Universal Health Access'), 'Community Health Outreach', 'Launch mobile units and health awareness drives.', 10000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Clean Water for Life'), 'Survey and Planning', 'Evaluate locations and draft blueprints.', 10000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Clean Water for Life'), 'Infrastructure Setup', 'Install filtration systems and pipelines.', 30000, '2025-08-01', 'pending', 1),
((select id from public.projects where title = 'Clean Water for Life'), 'Training & Sustainability', 'Train locals on maintenance and water hygiene.', 10000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Animal Rescue Network'), 'Shelter Renovation', 'Upgrade facilities to improve animal care.', 10000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Animal Rescue Network'), 'Medical Treatment', 'Provide necessary veterinary care and vaccinations.', 10000, '2025-08-01', 'pending', 1),
((select id from public.projects where title = 'Animal Rescue Network'), 'Adoption Campaign', 'Run outreach campaigns to boost adoptions.', 10000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Mindful Support'), 'Curriculum Design', 'Create mental wellness content tailored to youth.', 7500, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Mindful Support'), 'Training Facilitators', 'Train volunteers and psychologists for sessions.', 10000, '2025-08-01', 'pending', 1),
((select id from public.projects where title = 'Mindful Support'), 'Pilot Workshops', 'Conduct pilot workshops in local schools.', 7500, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Artists for Social Impact'), 'Artist Selection', 'Curate artists with a passion for social change.', 5000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Artists for Social Impact'), 'Community Murals', 'Paint murals reflecting community values.', 5000, '2025-08-01', 'pending', 1),
((select id from public.projects where title = 'Artists for Social Impact'), 'Public Showcase', 'Host events to share and discuss art impact.', 5000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Code the Future'), 'Curriculum Development', 'Design a coding curriculum for schools.', 10000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Code the Future'), 'Infrastructure Setup', 'Provide laptops and internet connectivity.', 15000, '2025-08-01', 'completed', 1),
((select id from public.projects where title = 'Code the Future'), 'Bootcamp Launch', 'Start hands-on bootcamps for students.', 15000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Emergency Response Fund'), 'Supplies Procurement', 'Purchase essential emergency kits.', 15000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Emergency Response Fund'), 'Training First Responders', 'Train local emergency response teams.', 40000, '2025-08-01', 'rejected', 1),
((select id from public.projects where title = 'Emergency Response Fund'), 'Community Drills', 'Run emergency preparedness drills.', 15000, '2025-09-01', 'pending', 2),

((select id from public.projects where title = 'Civic Leadership Lab'), 'Program Launch', 'Introduce leadership and civics curriculum.', 10000, '2025-07-01', 'approved', 0),
((select id from public.projects where title = 'Civic Leadership Lab'), 'Mentorship Network', 'Pair youth with experienced civic leaders.', 10000, '2025-08-01', 'pending', 1),
((select id from public.projects where title = 'Civic Leadership Lab'), 'Community Projects', 'Support student-led civic improvement projects.', 10000, '2025-09-01', 'pending', 2);
