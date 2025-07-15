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
-- Insert projects
insert into public.projects (
  title, description, current_amount, target_amount,
  min_investment, percentage_complete, kinder_count,
  category_id, image_url, kindler_id,
  social_links, project_location, slug
)
values
  (
    'Empowering Education',
    'Support education programs for children in low-income areas. Together, we can bridge the education gap and create opportunities for a brighter future.',
    40000, 55000, 10, 73, 40,
    (select id from categories where name = 'Education'),
    '/images/education.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://empoweringeducation.org", "twitter": "https://x.com/empoweringedu", "facebook": "https://www.facebook.com/EmpoweringEducation", "instagram": "https://www.instagram.com/empowering.education"}',
    'USA',
    'empowering-education'
  ),
  (
    'Forest Restoration Initiative',
    'Restore and reforest areas devastated by uncontrolled deforestation. Your support helps rebuild ecosystems and fight climate change.',
    54000, 60000, 10, 90, 35,
    (select id from categories where name = 'Environment & Sustainability'),
    '/images/bosques.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://www.therestorationinitiative.org", "facebook": "https://www.facebook.com/IUCNForest", "twitter": "https://x.com/iucn_forests", "youtube": "https://www.youtube.com/@IucnOrg"}',
    'CMR',
    'forest-restoration-initiative'
  ),
  (
    'Universal Health Access',
    'Provide basic health services, vaccinations, and medical support to underserved rural populations.',
    20000, 40000, 15, 50, 25,
    (select id from categories where name = 'Healthcare'),
    '/images/healthcare.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://www.who.int/health-topics/universal-health-coverage"}',
    'USA',
    'universal-health-access'
  ),
  (
    'Clean Water for Life',
    'Install clean water systems and filtration technologies in remote villages lacking access to potable water.',
    25000, 50000, 20, 50, 30,
    (select id from categories where name = 'Poverty Alleviation & Economic Development'),
    '/images/water.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://cleanwater.org", "facebook": "https://www.facebook.com/CleanWaterAction", "twitter": "https://twitter.com/cleanh2oaction", "instagram": "https://www.instagram.com/cleanh2oaction"}',
    'USA',
    'clean-water-life'
  ),
  (
    'Animal Rescue Network',
    'Establish a rescue network for stray and injured animals, providing medical care and adoption support.',
    15000, 30000, 5, 50, 15,
    (select id from categories where name = 'Animal Welfare'),
    '/images/dogs.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://rescuenetworkmn.org", "facebook": "https://www.facebook.com/rescuenetworkmn", "instagram": "https://www.instagram.com/rescuenetworkmn"}',
    'USA',
    'animal-rescue-network'
  ),
  (
    'Mindful Support',
    'Develop and distribute an easy-to-use mobile app that provides resources, exercises, and mental health support to young adults.',
    10000, 25000, 2, 40, 20,
    (select id from categories where name = 'Mental Health & Well-being'),
    '/images/mental-health.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://www.mindful-support.com"}',
    'CAN',
    'mindful-support'
  ),
  (
    'Artists for Social Impact',
    'Fund artistic initiatives that highlight social justice, encourage civic engagement, and spark policy changes.',
    8000, 15000, 1, 53, 12,
    (select id from categories where name = 'Arts & Culture'),
    '/images/artesania.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://artisticfreedominitiative.org/our-programs/artists-for-social-change", "facebook": "https://www.facebook.com/Artistic-Freedom-Initiative-1631480230423882", "youtube": "https://www.youtube.com/channel/UCWdqdu8eOGV8cfDLpMtYjXg", "twitter": "https://twitter.com/artistic_AFI", "linkedin": "https://www.linkedin.com/company/artistic-freedom-initiative", "instagram": "https://www.instagram.com/artistic_freedom_initiative"}',
    'USA',
    'artists-social-impact'
  ),
  (
    'Code the Future',
    'Deliver coding and digital literacy training for high school students in low-resource communities.',
    30000, 40000, 12, 75, 28,
    (select id from categories where name = 'Technology & Innovation'),
    '/images/technology.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://codeforfuture.eu"}',
    'GBR',
    'code-future'
  ),
  (
    'Emergency Response Fund',
    'Deliver essential supplies, shelter, and food to communities affected by floods, earthquakes, and other disasters.',
    45000, 70000, 25, 64, 33,
    (select id from categories where name = 'Disaster Relief & Humanitarian Aid'),
    '/images/disaster-aid.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://cerf.un.org"}',
    'DEU',
    'emergency-response-fund'
  ),
  (
    'Civic Leadership Lab',
    'Train young leaders in community organizing, policy advocacy, and civic education to promote democratic values.',
    12000, 30000, 7, 40, 19,
    (select id from categories where name = 'Community & Civic Engagement'),
    '/images/ecommerce.webp',
    '00000000-0000-0000-0000-000000000001',
    '{"website": "https://kravislab.cmc.edu", "facebook": "https://www.facebook.com/KravisLabCMC", "instagram": "https://www.instagram.com/KravisLabCMC", "twitter": "https://twitter.com/KravisLabCMC", "youtube": "https://www.youtube.com/channel/UCygX0UgZVwqC_szfUn_3NRw", "linkedin": "https://www.linkedin.com/company/kravis-lab-for-social-impact"}',
    'USA',
    'civic-leadership-lab'
  );

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
  ((select id from public.projects where title = 'Empowering Education'), 'c124b016-bab9-4904-8e1a-c38b8623001b', 'core', 'Education Specialist'),
  ((select id from public.projects where title = 'Empowering Education'), '44e69d1d-2659-4a51-82ce-487e8c9ef320', 'advisor', 'Community Liaison'),

  ((select id from public.projects where title = 'Forest Restoration Initiative'), 'bcc18c37-3a33-4585-9af0-0e163cbb3850', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Forest Restoration Initiative'), '5af02f63-3be5-44e4-bd3a-0964b1dc8e39', 'core', 'Field Officer'),
  ((select id from public.projects where title = 'Forest Restoration Initiative'), '2c8a13a2-0a76-4758-84bd-12a633cf598c', 'editor', 'Research Analyst'),

  ((select id from public.projects where title = 'Universal Health Access'), '0876de6c-f9ad-4ba2-b4a3-725ddbb8d498', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Universal Health Access'), 'ba754a4b-c267-4d70-8c1a-00154f9b1cf1', 'advisor', 'Medical Advisor'),
  ((select id from public.projects where title = 'Universal Health Access'), 'eee0c1ac-86c6-4024-a5e3-c5f350626b6a', 'editor', 'Outreach Manager'),

  ((select id from public.projects where title = 'Clean Water for Life'), '31738359-04ef-418d-a6e5-59e9de312dab', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Clean Water for Life'), 'fec8063f-59a9-4e66-a6c8-c9f5c4a57353', 'editor', 'Sanitation Officer'),
  ((select id from public.projects where title = 'Clean Water for Life'), '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', 'community', 'Trainer'),

  ((select id from public.projects where title = 'Animal Rescue Network'), 'e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Animal Rescue Network'), '8e05ed73-6be8-4e23-bd02-3a8344cef8d4', 'core', 'Veterinarian'),
  ((select id from public.projects where title = 'Animal Rescue Network'), 'e52ed5c4-722d-4380-853e-7530db295722', 'community', 'Adoption Lead'),

  ((select id from public.projects where title = 'Mindful Support'), '51fdcab5-7789-429d-bb3b-844139921e84', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Mindful Support'), '55499a3c-f7d8-492b-a790-4223f29467b1', 'editor', 'UX Designer'),
  ((select id from public.projects where title = 'Mindful Support'), 'b5780351-aba6-459e-8d41-3fbd3a5018bf', 'advisor', 'Counselor'),

  ((select id from public.projects where title = 'Artists for Social Impact'), 'ff517450-e235-477e-a058-a2a73608dd69', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Artists for Social Impact'), 'f51272df-fd8f-4826-adf8-58aa6378cb32', 'core', 'Creative Director'),
  ((select id from public.projects where title = 'Artists for Social Impact'), 'bc6176d7-72c0-4b4c-b2b5-44cde3438517', 'editor', 'Storyteller'),

  ((select id from public.projects where title = 'Code the Future'), '8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Code the Future'), 'ad549c42-5906-41a8-a08f-5d810e01d2eb', 'core', 'Software Engineer'),
  ((select id from public.projects where title = 'Code the Future'), '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', 'others', 'Program Manager'),

  ((select id from public.projects where title = 'Emergency Response Fund'), '1609aba1-bcbb-426b-ae57-456f02e16de7', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Emergency Response Fund'), '8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', 'core', 'Logistics Specialist'),
  ((select id from public.projects where title = 'Emergency Response Fund'), 'ad549c42-5906-41a8-a08f-5d810e01d2eb', 'editor', 'Field Manager'),

  ((select id from public.projects where title = 'Civic Leadership Lab'), '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', 'admin', 'Founder'),
  ((select id from public.projects where title = 'Civic Leadership Lab'), '81d3ff4d-b5de-42e7-a53d-26f275fe7668', 'advisor', 'Policy Mentor'),
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

-- Insert updates for each project
INSERT INTO project_updates (id, title, content, author_id, project_id, created_at) VALUES
('d2538d90-cce7-4efa-98a2-468e5398f302', 'Progress on Empowering', 'Empowering Education is making significant strides. In this phase, we''re focusing on team building.', 'fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', (SELECT id FROM projects WHERE title = 'Empowering Education'), '2025-04-27T21:08:17.417996'),
('97e41c02-3657-425d-8f76-0c3ef99c78dd', 'Update on Empowering', 'Empowering Education is making significant strides. In this phase, we''re focusing on community engagement.', 'c124b016-bab9-4904-8e1a-c38b8623001b', (SELECT id FROM projects WHERE title = 'Empowering Education'), '2025-05-05T21:08:17.417996'),
('9bda654e-1a07-448e-ad1c-07f9fb0ab618', 'Insight on Empowering', 'Empowering Education is making significant strides. In this phase, we''re focusing on technical implementation.', '44e69d1d-2659-4a51-82ce-487e8c9ef320', (SELECT id FROM projects WHERE title = 'Empowering Education'), '2025-05-01T21:08:17.417996'),
('309fd6ca-cabd-4baa-9227-73e8b1dc8e49', 'Progress on Forest', 'Forest Restoration Initiative is making significant strides. In this phase, we''re focusing on team building.', '2c8a13a2-0a76-4758-84bd-12a633cf598c', (SELECT id FROM projects WHERE title = 'Forest Restoration Initiative'), '2025-05-08T21:08:17.417996'),
('ecd669c2-7906-444d-b7dc-fe6e6064eb4f', 'Update on Forest', 'Forest Restoration Initiative is making significant strides. In this phase, we''re focusing on community engagement.', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', (SELECT id FROM projects WHERE title = 'Forest Restoration Initiative'), '2025-04-30T21:08:17.417996'),
('7a7a1d7f-9d94-41e0-b55f-1e1df39f160a', 'Insight on Forest', 'Forest Restoration Initiative is making significant strides. In this phase, we''re focusing on technical implementation.', '5af02f63-3be5-44e4-bd3a-0964b1dc8e39', (SELECT id FROM projects WHERE title = 'Forest Restoration Initiative'), '2025-04-15T21:08:17.417996'),
('e2a327a8-7dc0-49d5-a729-e8ac641958a0', 'Progress on Universal', 'Universal Health Access is making significant strides. In this phase, we''re focusing on team building.', 'eee0c1ac-86c6-4024-a5e3-c5f350626b6a', (SELECT id FROM projects WHERE title = 'Universal Health Access'), '2025-04-17T21:08:17.417996'),
('d4e4f6cf-1e3e-4f68-83cc-938618ad20ee', 'Update on Universal', 'Universal Health Access is making significant strides. In this phase, we''re focusing on community engagement.', '0876de6c-f9ad-4ba2-b4a3-725ddbb8d498', (SELECT id FROM projects WHERE title = 'Universal Health Access'), '2025-04-22T21:08:17.417996'),
('d2470ca2-49d0-49ce-b843-d4af5d85d196', 'Insight on Universal', 'Universal Health Access is making significant strides. In this phase, we''re focusing on technical implementation.', 'ba754a4b-c267-4d70-8c1a-00154f9b1cf1', (SELECT id FROM projects WHERE title = 'Universal Health Access'), '2025-04-20T21:08:17.417996'),
('de9f172f-90bf-41c2-b7d6-cb0579fb980c', 'Progress on Clean', 'Clean Water for Life is making significant strides. In this phase, we''re focusing on team building.', 'fec8063f-59a9-4e66-a6c8-c9f5c4a57353', (SELECT id FROM projects WHERE title = 'Clean Water for Life'), '2025-05-06T21:08:17.417996'),
('d2ea9bab-e2d4-4100-9ea0-06d243f94b9b', 'Update on Clean', 'Clean Water for Life is making significant strides. In this phase, we''re focusing on community engagement.', '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', (SELECT id FROM projects WHERE title = 'Clean Water for Life'), '2025-04-29T21:08:17.417996'),
('4472059e-b57f-4bc4-ae4e-0bacd58c1084', 'Insight on Clean', 'Clean Water for Life is making significant strides. In this phase, we''re focusing on technical implementation.', '31738359-04ef-418d-a6e5-59e9de312dab', (SELECT id FROM projects WHERE title = 'Clean Water for Life'), '2025-05-09T21:08:17.417996'),
('85f9956e-9fc1-403d-8717-0624ec2fee96', 'Progress on Animal', 'Animal Rescue Network is making significant strides. In this phase, we''re focusing on team building.', 'e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', (SELECT id FROM projects WHERE title = 'Animal Rescue Network'), '2025-04-30T21:08:17.417996'),
('ec3e1ad9-7f79-44ca-99cd-58cd3bcb0899', 'Update on Animal', 'Animal Rescue Network is making significant strides. In this phase, we''re focusing on community engagement.', '8e05ed73-6be8-4e23-bd02-3a8344cef8d4', (SELECT id FROM projects WHERE title = 'Animal Rescue Network'), '2025-04-22T21:08:17.417996'),
('b07d91ac-768b-4f83-9a5d-65100f2066de', 'Insight on Animal', 'Animal Rescue Network is making significant strides. In this phase, we''re focusing on technical implementation.', 'e52ed5c4-722d-4380-853e-7530db295722', (SELECT id FROM projects WHERE title = 'Animal Rescue Network'), '2025-04-27T21:08:17.417996'),
('b6999dc7-9d78-4f23-a04f-2834d58cf5e6', 'Progress on Mindful', 'Mindful Support is making significant strides. In this phase, we''re focusing on team building.', '51fdcab5-7789-429d-bb3b-844139921e84', (SELECT id FROM projects WHERE title = 'Mindful Support'), '2025-05-02T21:08:17.417996'),
('f3fc3555-cfae-4b9a-8e14-529bf2e96922', 'Update on Mindful', 'Mindful Support is making significant strides. In this phase, we''re focusing on community engagement.', '55499a3c-f7d8-492b-a790-4223f29467b1', (SELECT id FROM projects WHERE title = 'Mindful Support'), '2025-04-14T21:08:17.417996'),
('18ce539a-b897-4575-ad14-824852ec1636', 'Insight on Mindful', 'Mindful Support is making significant strides. In this phase, we''re focusing on technical implementation.', 'b5780351-aba6-459e-8d41-3fbd3a5018bf', (SELECT id FROM projects WHERE title = 'Mindful Support'), '2025-04-28T21:08:17.417996'),
('240f3377-0c10-4bca-b74a-42c8071f7f58', 'Progress on Artists', 'Artists for Social Impact is making significant strides. In this phase, we''re focusing on team building.', 'ff517450-e235-477e-a058-a2a73608dd69', (SELECT id FROM projects WHERE title = 'Artists for Social Impact'), '2025-04-17T21:08:17.417996'),
('51b2076a-1608-4df7-b1c1-be223dd9bb7b', 'Update on Artists', 'Artists for Social Impact is making significant strides. In this phase, we''re focusing on community engagement.', 'f51272df-fd8f-4826-adf8-58aa6378cb32', (SELECT id FROM projects WHERE title = 'Artists for Social Impact'), '2025-04-27T21:08:17.417996'),
('83e70110-bfc5-42a5-b359-9d824ce7326c', 'Insight on Artists', 'Artists for Social Impact is making significant strides. In this phase, we''re focusing on technical implementation.', 'bc6176d7-72c0-4b4c-b2b5-44cde3438517', (SELECT id FROM projects WHERE title = 'Artists for Social Impact'), '2025-05-06T21:08:17.417996'),
('fabf84a8-ffaa-4534-80bb-a780a23ffac9', 'Progress on Code', 'Code the Future is making significant strides. In this phase, we''re focusing on team building.', '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', (SELECT id FROM projects WHERE title = 'Code the Future'), '2025-04-16T21:08:17.417996'),
('5e8e808e-7e08-4997-a177-cd101782ce4f', 'Update on Code', 'Code the Future is making significant strides. In this phase, we''re focusing on community engagement.', '8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', (SELECT id FROM projects WHERE title = 'Code the Future'), '2025-05-01T21:08:17.417996'),
('306a5d31-5848-4f3e-ad7b-de09f4d896ef', 'Insight on Code', 'Code the Future is making significant strides. In this phase, we''re focusing on technical implementation.', 'ad549c42-5906-41a8-a08f-5d810e01d2eb', (SELECT id FROM projects WHERE title = 'Code the Future'), '2025-05-08T21:08:17.417996'),
('231ed57d-4225-4824-a552-a094541d99ad', 'Progress on Emergency', 'Emergency Response Fund is making significant strides. In this phase, we''re focusing on team building.', '8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', (SELECT id FROM projects WHERE title = 'Emergency Response Fund'), '2025-05-01T21:08:17.417996'),
('8a26819d-a4a6-4845-a29f-d1054ecfda10', 'Update on Emergency', 'Emergency Response Fund is making significant strides. In this phase, we''re focusing on community engagement.', '1609aba1-bcbb-426b-ae57-456f02e16de7', (SELECT id FROM projects WHERE title = 'Emergency Response Fund'), '2025-05-03T21:08:17.417996'),
('969efd60-fe70-4c72-9429-2720dcad3a5f', 'Insight on Emergency', 'Emergency Response Fund is making significant strides. In this phase, we''re focusing on technical implementation.', 'ad549c42-5906-41a8-a08f-5d810e01d2eb', (SELECT id FROM projects WHERE title = 'Emergency Response Fund'), '2025-04-27T21:08:17.417996'),
('f561832d-5f99-4565-a12d-1d7784ac4f16', 'Progress on Civic', 'Civic Leadership Lab is making significant strides. In this phase, we''re focusing on team building.', '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', (SELECT id FROM projects WHERE title = 'Civic Leadership Lab'), '2025-04-16T21:08:17.417996'),
('f158cd89-3caa-4cf2-809a-8ffc58ee41ae', 'Update on Civic', 'Civic Leadership Lab is making significant strides. In this phase, we''re focusing on community engagement.', '81d3ff4d-b5de-42e7-a53d-26f275fe7668', (SELECT id FROM projects WHERE title = 'Civic Leadership Lab'), '2025-04-16T21:08:17.417996'),
('9452ce24-a4ff-420c-afda-9430e5393673', 'Insight on Civic', 'Civic Leadership Lab is making significant strides. In this phase, we''re focusing on technical implementation.', '81d3ff4d-b5de-42e7-a53d-26f275fe7668', (SELECT id FROM projects WHERE title = 'Civic Leadership Lab'), '2025-04-22T21:08:17.417996');

-- Insert comments on updates
INSERT INTO comments (id, content, author_id, project_update_id, created_at, type) VALUES
('429f7c7d-98c4-4388-af6f-f39a94466517', 'Looking forward to seeing this evolve.', '08bf1aed-8822-4d99-84ae-f89fcf46624a', 'd2538d90-cce7-4efa-98a2-468e5398f302', '2025-04-28T02:08:17.417996', 'comment'),
('164e5e76-a079-4c0b-b4e5-8a8d3b52c2b5', 'This sounds promising!', '81d3ff4d-b5de-42e7-a53d-26f275fe7668', 'd2538d90-cce7-4efa-98a2-468e5398f302', '2025-04-28T06:08:17.417996', 'comment'),
('39f569fb-48f9-4bfd-a2a1-2299f62ae28a', 'Could you share more details on this part?', '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', '97e41c02-3657-425d-8f76-0c3ef99c78dd', '2025-05-08T18:08:17.417996', 'comment'),
('3c85edf7-9de1-42aa-8bdb-178d318aab3b', 'Looking forward to seeing this evolve.', '44e69d1d-2659-4a51-82ce-487e8c9ef320', '97e41c02-3657-425d-8f76-0c3ef99c78dd', '2025-05-08T10:08:17.417996', 'comment'),
('41d252c2-9e43-4120-aa56-0221abdccd26', 'Could you share more details on this part?', '08bf1aed-8822-4d99-84ae-f89fcf46624a', '9bda654e-1a07-448e-ad1c-07f9fb0ab618', '2025-05-02T09:08:17.417996', 'comment'),
('70aa22b7-6980-4e64-8900-7ba7ff43eb6a', 'Interesting! Is there a timeline?', '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', '9bda654e-1a07-448e-ad1c-07f9fb0ab618', '2025-05-03T13:08:17.417996', 'comment'),
('d19a317e-96f6-49f8-a354-1a10de513b21', 'This sounds promising!', '08bf1aed-8822-4d99-84ae-f89fcf46624a', '309fd6ca-cabd-4baa-9227-73e8b1dc8e49', '2025-05-10T14:08:17.417996', 'comment'),
('4324a3d1-6e7c-424c-a02b-b9e6b34177cc', 'This sounds promising!', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', '309fd6ca-cabd-4baa-9227-73e8b1dc8e49', '2025-05-11T04:08:17.417996', 'comment'),
('90e0fe95-3234-4774-bbed-9acf5fb0bada', 'Could you share more details on this part?', '31738359-04ef-418d-a6e5-59e9de312dab', 'ecd669c2-7906-444d-b7dc-fe6e6064eb4f', '2025-05-02T20:08:17.417996', 'comment'),
('ad535c79-f5cf-4b22-bfb6-bf8f05c64640', 'This sounds promising!', '5af02f63-3be5-44e4-bd3a-0964b1dc8e39', 'ecd669c2-7906-444d-b7dc-fe6e6064eb4f', '2025-05-02T04:08:17.417996', 'comment'),
('ba3f47ea-f6ca-43f1-a802-e635d02a1d53', 'Great job team!', 'fec8063f-59a9-4e66-a6c8-c9f5c4a57353', '7a7a1d7f-9d94-41e0-b55f-1e1df39f160a', '2025-04-18T08:08:17.417996', 'comment'),
('aefd3fe1-8ef4-405a-b11a-6a45025eaa23', 'Could you share more details on this part?', '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', '7a7a1d7f-9d94-41e0-b55f-1e1df39f160a', '2025-04-16T16:08:17.417996', 'comment'),
('3ae8e182-e942-475f-abe5-07a124927754', 'Interesting! Is there a timeline?', '2c8a13a2-0a76-4758-84bd-12a633cf598c', 'e2a327a8-7dc0-49d5-a729-e8ac641958a0', '2025-04-20T15:08:17.417996', 'comment'),
('8211d07a-de64-4ef8-8a15-61bb1306b77b', 'Great job team!', '0876de6c-f9ad-4ba2-b4a3-725ddbb8d498', 'e2a327a8-7dc0-49d5-a729-e8ac641958a0', '2025-04-20T20:08:17.417996', 'comment'),
('0af55ea5-4bc7-4ed5-85ae-75be15c6c88b', 'Interesting! Is there a timeline?', '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', 'd4e4f6cf-1e3e-4f68-83cc-938618ad20ee', '2025-04-24T12:08:17.417996', 'comment'),
('2540de69-2507-4cf8-8489-badca62bcd72', 'Looking forward to seeing this evolve.', 'ba754a4b-c267-4d70-8c1a-00154f9b1cf1', 'd4e4f6cf-1e3e-4f68-83cc-938618ad20ee', '2025-04-25T12:08:17.417996', 'comment'),
('43b485e6-7b9f-4558-8656-824da159792c', 'Could you share more details on this part?', '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', 'd2470ca2-49d0-49ce-b843-d4af5d85d196', '2025-04-22T14:08:17.417996', 'comment'),
('9b5c7aa4-3ca3-47dc-a4b1-b15286125136', 'This sounds promising!', '2c8a13a2-0a76-4758-84bd-12a633cf598c', 'd2470ca2-49d0-49ce-b843-d4af5d85d196', '2025-04-23T06:08:17.417996', 'comment'),
('28244947-c400-4c04-b38e-a3ec9caa4a54', 'Great job team!', 'eee0c1ac-86c6-4024-a5e3-c5f350626b6a', 'de9f172f-90bf-41c2-b7d6-cb0579fb980c', '2025-05-07T18:08:17.417996', 'comment'),
('8658f917-ca9b-443b-8f29-42d1d580bcdf', 'This sounds promising!', '8f665ffb-d1bf-43da-90b6-1f2bb88d91ca', 'de9f172f-90bf-41c2-b7d6-cb0579fb980c', '2025-05-09T01:08:17.417996', 'comment'),
('bc04f19f-f960-455d-bd74-cdce5e2b1a6f', 'Looking forward to seeing this evolve.', '8f665ffb-d1bf-43da-90b6-1f2bb88d91ca', 'd2ea9bab-e2d4-4100-9ea0-06d243f94b9b', '2025-05-02T21:08:17.417996', 'comment'),
('7ae3be1d-23c6-4d20-9ab3-0b5fbb63fc74', 'Great job team!', '31738359-04ef-418d-a6e5-59e9de312dab', 'd2ea9bab-e2d4-4100-9ea0-06d243f94b9b', '2025-05-01T08:08:17.417996', 'comment'),
('ca858960-14fd-4a5d-b240-e254e4553f49', 'How can we help with this?', '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', '4472059e-b57f-4bc4-ae4e-0bacd58c1084', '2025-05-12T00:08:17.417996', 'comment'),
('5ef81a77-ad7d-45a0-9af6-83a12908ffeb', 'Interesting! Is there a timeline?', 'eee0c1ac-86c6-4024-a5e3-c5f350626b6a', '4472059e-b57f-4bc4-ae4e-0bacd58c1084', '2025-05-10T12:08:17.417996', 'comment'),
('8efb72f8-0b0d-41ac-972c-60544c52af0e', 'Looking forward to seeing this evolve.', 'fec8063f-59a9-4e66-a6c8-c9f5c4a57353', '85f9956e-9fc1-403d-8717-0624ec2fee96', '2025-05-02T06:08:17.417996', 'comment'),
('5afa03a4-c76e-441e-8f56-989b6427d57d', 'How can we help with this?', '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', '85f9956e-9fc1-403d-8717-0624ec2fee96', '2025-05-01T04:08:17.417996', 'comment'),
('9b6243b0-9f62-4ca4-9c93-fd350dc59159', 'Great job team!', '8fdf59c8-98ab-4fdd-bbf3-4578b59d959d', 'ec3e1ad9-7f79-44ca-99cd-58cd3bcb0899', '2025-04-25T21:08:17.417996', 'comment'),
('00d7ed5a-5779-4b7a-98bc-293b632115a2', 'Looking forward to seeing this evolve.', '1616f605-613d-49d8-b933-efad3fbc688c', 'ec3e1ad9-7f79-44ca-99cd-58cd3bcb0899', '2025-04-25T05:08:17.417996', 'comment'),
('7b055ae4-cbb2-4044-80fa-3e32bdc54952', 'Looking forward to seeing this evolve.', '1616f605-613d-49d8-b933-efad3fbc688c', 'b07d91ac-768b-4f83-9a5d-65100f2066de', '2025-04-27T22:08:17.417996', 'comment'),
('a3a09d10-8250-415c-ae79-44793b9a9c3b', 'How can we help with this?', 'fec8063f-59a9-4e66-a6c8-c9f5c4a57353', 'b07d91ac-768b-4f83-9a5d-65100f2066de', '2025-04-30T06:08:17.417996', 'comment'),
('b5d4dde8-f048-4337-b41d-7029830a4b90', 'Great job team!', 'e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', 'b6999dc7-9d78-4f23-a04f-2834d58cf5e6', '2025-05-04T06:08:17.417996', 'comment'),
('d8e3f79b-ceab-4143-b38d-6ba08584f40e', 'Could you share more details on this part?', '8e05ed73-6be8-4e23-bd02-3a8344cef8d4', 'b6999dc7-9d78-4f23-a04f-2834d58cf5e6', '2025-05-05T11:08:17.417996', 'comment'),
('53f07000-b5fe-46d6-b758-668c055336b4', 'Interesting! Is there a timeline?', '8e05ed73-6be8-4e23-bd02-3a8344cef8d4', 'f3fc3555-cfae-4b9a-8e14-529bf2e96922', '2025-04-15T03:08:17.417996', 'comment'),
('af5c7b1b-9b48-45e9-909a-f2342b754e63', 'Interesting! Is there a timeline?', 'e52ed5c4-722d-4380-853e-7530db295722', 'f3fc3555-cfae-4b9a-8e14-529bf2e96922', '2025-04-15T21:08:17.417996', 'comment'),
('f8990607-8b82-42dd-8ae8-199b45aa335a', 'This sounds promising!', 'e52ed5c4-722d-4380-853e-7530db295722', '18ce539a-b897-4575-ad14-824852ec1636', '2025-05-01T12:08:17.417996', 'comment'),
('95594400-53c2-4367-8641-294b3cea9b0e', 'How can we help with this?', 'e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', '18ce539a-b897-4575-ad14-824852ec1636', '2025-04-30T08:08:17.417996', 'comment'),
('f29a643a-2573-4187-9fd3-4292f6859b9e', 'Interesting! Is there a timeline?', '51fdcab5-7789-429d-bb3b-844139921e84', '240f3377-0c10-4bca-b74a-42c8071f7f58', '2025-04-19T06:08:17.417996', 'comment'),
('16148392-a417-420f-9d5f-d06a7ed45051', 'This sounds promising!', '55499a3c-f7d8-492b-a790-4223f29467b1', '240f3377-0c10-4bca-b74a-42c8071f7f58', '2025-04-19T13:08:17.417996', 'comment'),
('dff9a761-14ce-4b99-b132-468dc7d0f725', 'Looking forward to seeing this evolve.', '55499a3c-f7d8-492b-a790-4223f29467b1', '51b2076a-1608-4df7-b1c1-be223dd9bb7b', '2025-04-29T07:08:17.417996', 'comment'),
('6722fab6-ee5c-4c5d-8b09-0210c7d98ee7', 'This sounds promising!', 'b5780351-aba6-459e-8d41-3fbd3a5018bf', '51b2076a-1608-4df7-b1c1-be223dd9bb7b', '2025-04-30T14:08:17.417996', 'comment'),
('7e14c79c-fae5-4e6f-b71d-04c516881723', 'Looking forward to seeing this evolve.', 'b5780351-aba6-459e-8d41-3fbd3a5018bf', '83e70110-bfc5-42a5-b359-9d824ce7326c', '2025-05-08T00:08:17.417996', 'comment'),
('dbff6b94-beb3-42a4-96a9-b714fd662ced', 'Looking forward to seeing this evolve.', '51fdcab5-7789-429d-bb3b-844139921e84', '83e70110-bfc5-42a5-b359-9d824ce7326c', '2025-05-08T10:08:17.417996', 'comment'),
('dd1a0ad7-c9e9-4b78-a907-f9afb652363e', 'Great job team!', 'ff517450-e235-477e-a058-a2a73608dd69', 'fabf84a8-ffaa-4534-80bb-a780a23ffac9', '2025-04-17T23:08:17.417996', 'comment'),
('6b5fd756-9dee-4a32-95dc-29c0a77ed3cf', 'Interesting! Is there a timeline?', 'f51272df-fd8f-4826-adf8-58aa6378cb32', 'fabf84a8-ffaa-4534-80bb-a780a23ffac9', '2025-04-17T03:08:17.417996', 'comment'),
('dd42db67-864d-45df-af3a-1053091aa29c', 'How can we help with this?', 'f51272df-fd8f-4826-adf8-58aa6378cb32', '5e8e808e-7e08-4997-a177-cd101782ce4f', '2025-05-04T19:08:17.417996', 'comment'),
('aaba4aa2-236a-4314-87fb-dc4492264317', 'This sounds promising!', 'bc6176d7-72c0-4b4c-b2b5-44cde3438517', '5e8e808e-7e08-4997-a177-cd101782ce4f', '2025-05-02T10:08:17.417996', 'comment'),
('f78a38e0-d123-4788-895b-04828b6bfc0e', 'Great job team!', 'bc6176d7-72c0-4b4c-b2b5-44cde3438517', '306a5d31-5848-4f3e-ad7b-de09f4d896ef', '2025-05-10T18:08:17.417996', 'comment'),
('939b04ae-6853-4523-967a-a6d2452f4460', 'Interesting! Is there a timeline?', 'ff517450-e235-477e-a058-a2a73608dd69', '306a5d31-5848-4f3e-ad7b-de09f4d896ef', '2025-05-10T07:08:17.417996', 'comment'),
('c53bc865-d227-4b77-b4d7-eed862f1325e', 'Looking forward to seeing this evolve.', '5af02f63-3be5-44e4-bd3a-0964b1dc8e39', '231ed57d-4225-4824-a552-a094541d99ad', '2025-05-02T21:08:17.417996', 'comment'),
('f2ace43a-b5a1-4951-aec5-2cc1206b2db3', 'How can we help with this?', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', '231ed57d-4225-4824-a552-a094541d99ad', '2025-05-02T03:08:17.417996', 'comment'),
('7a138d0e-8791-456f-a89a-97f6861b41fb', 'This sounds promising!', 'fec8063f-59a9-4e66-a6c8-c9f5c4a57353', '8a26819d-a4a6-4845-a29f-d1054ecfda10', '2025-05-06T07:08:17.417996', 'comment'),
('c099f87b-6a8f-4e60-a3f6-60aa5e90ed39', 'Interesting! Is there a timeline?', 'eee0c1ac-86c6-4024-a5e3-c5f350626b6a', '8a26819d-a4a6-4845-a29f-d1054ecfda10', '2025-05-05T18:08:17.417996', 'comment'),
('b8e50ca6-372d-4dbc-8967-c9d8848d0591', 'Could you share more details on this part?', '1616f605-613d-49d8-b933-efad3fbc688c', '969efd60-fe70-4c72-9429-2720dcad3a5f', '2025-04-29T16:08:17.417996', 'comment'),
('b98c6938-4575-443c-b8d0-c545723bdb7e', 'Could you share more details on this part?', '2c8a13a2-0a76-4758-84bd-12a633cf598c', '969efd60-fe70-4c72-9429-2720dcad3a5f', '2025-04-29T03:08:17.417996', 'comment'),
('47e01309-3299-4c35-9b8e-27fffbed1296', 'This sounds promising!', '08bf1aed-8822-4d99-84ae-f89fcf46624a', 'f561832d-5f99-4565-a12d-1d7784ac4f16', '2025-04-17T05:08:17.417996', 'comment'),
('b68b1bd3-d1bd-40f0-8154-789d0bb82829', 'Great job team!', '51fdcab5-7789-429d-bb3b-844139921e84', 'f561832d-5f99-4565-a12d-1d7784ac4f16', '2025-04-18T13:08:17.417996', 'comment'),
('5d5c1ae5-3b48-499f-a194-0c176f13763f', 'This sounds promising!', '51fdcab5-7789-429d-bb3b-844139921e84', 'f158cd89-3caa-4cf2-809a-8ffc58ee41ae', '2025-04-18T11:08:17.417996', 'comment'),
('0ecb45e9-f82f-4e22-8e4a-c196a3d43653', 'This sounds promising!', 'fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'f158cd89-3caa-4cf2-809a-8ffc58ee41ae', '2025-04-18T16:08:17.417996', 'comment'),
('f61542a7-3285-470a-90cb-0ed0523f5db0', 'This sounds promising!', 'c124b016-bab9-4904-8e1a-c38b8623001b', '9452ce24-a4ff-420c-afda-9430e5393673', '2025-04-24T10:08:17.417996', 'comment'),
('09d562b0-f35d-4dd5-9168-091cada3abf1', 'How can we help with this?', '08bf1aed-8822-4d99-84ae-f89fcf46624a', '9452ce24-a4ff-420c-afda-9430e5393673', '2025-04-23T12:08:17.417996', 'comment');

-- Insert project-related questions
INSERT INTO comments (id, content, author_id, type, project_id, created_at)
VALUES
('bbc150c3-3524-492f-89fd-bae7ed410518', 'What is the long-term impact of this project?', '81d3ff4d-b5de-42e7-a53d-26f275fe7668', 'question', (SELECT id FROM projects WHERE title = 'Empowering Education'), '2025-05-14T15:00:00'),
('6982263d-f403-4a7a-a70c-27daf1c91f47', 'How can contributors help in this initiative?', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', 'question', (SELECT id FROM projects WHERE title = 'Empowering Education'), '2025-05-14T15:02:00'),
('18960f4d-efb5-47f7-947f-ee00c5b7b2a8', 'What is the long-term impact of this project?', 'fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'question', (SELECT id FROM projects WHERE title = 'Forest Restoration Initiative'), '2025-05-14T15:05:00'),
('d75e6f99-162c-4b63-9466-0f2cdf2316cd', 'How can contributors help in this initiative?', 'ad549c42-5906-41a8-a08f-5d810e01d2eb', 'question', (SELECT id FROM projects WHERE title = 'Forest Restoration Initiative'), '2025-05-14T15:07:00'),
('82da46ab-68e7-45d6-8bea-4e3e8a938906', 'What is the long-term impact of this project?', '08bf1aed-8822-4d99-84ae-f89fcf46624a', 'question', (SELECT id FROM projects WHERE title = 'Universal Health Access'), '2025-05-14T15:10:00'),
('eaf62672-7531-4517-b2f0-9b68f700be20', 'How can contributors help in this initiative?', '55499a3c-f7d8-492b-a790-4223f29467b1', 'question', (SELECT id FROM projects WHERE title = 'Universal Health Access'), '2025-05-14T15:12:00'),
('30d91aab-6793-4fa4-ad94-b9864b39d30d', 'What is the long-term impact of this project?', 'fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'question', (SELECT id FROM projects WHERE title = 'Clean Water for Life'), '2025-05-14T15:15:00'),
('4a7d1c26-2e59-4fcb-93df-dbc7a3c2064f', 'How can contributors help in this initiative?', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', 'question', (SELECT id FROM projects WHERE title = 'Clean Water for Life'), '2025-05-14T15:17:00'),
('2a18b402-90dc-4e79-a278-4a13b8a06b42', 'What is the long-term impact of this project?', 'c124b016-bab9-4904-8e1a-c38b8623001b', 'question', (SELECT id FROM projects WHERE title = 'Animal Rescue Network'), '2025-05-14T15:20:00'),
('4b16231a-3c0d-4c53-9a64-8542b0bad3c0', 'How can contributors help in this initiative?', 'fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'question', (SELECT id FROM projects WHERE title = 'Animal Rescue Network'), '2025-05-14T15:22:00'),
('8d3fee7e-91c5-4c7f-a7bf-6d8ebe5ce951', 'What is the long-term impact of this project?', 'c124b016-bab9-4904-8e1a-c38b8623001b', 'question', (SELECT id FROM projects WHERE title = 'Mindful Support'), '2025-05-14T15:25:00'),
('3aa44b69-6296-48bc-9fef-7e930e7c1170', 'How can contributors help in this initiative?', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', 'question', (SELECT id FROM projects WHERE title = 'Mindful Support'), '2025-05-14T15:27:00'),
('a3eade33-d373-48c8-b481-2bf6971e9dea', 'What is the long-term impact of this project?', 'c124b016-bab9-4904-8e1a-c38b8623001b', 'question', (SELECT id FROM projects WHERE title = 'Artists for Social Impact'), '2025-05-14T15:30:00'),
('dd5f6941-b27f-4963-bf41-698209f0354a', 'How can contributors help in this initiative?', '55499a3c-f7d8-492b-a790-4223f29467b1', 'question', (SELECT id FROM projects WHERE title = 'Artists for Social Impact'), '2025-05-14T15:32:00'),
('647eac37-6041-4beb-a2ae-f10784998829', 'What is the long-term impact of this project?', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', 'question', (SELECT id FROM projects WHERE title = 'Code the Future'), '2025-05-14T15:35:00'),
('800d6013-ca3d-4b9c-bac1-d918b0ddbb4a', 'How can contributors help in this initiative?', '08bf1aed-8822-4d99-84ae-f89fcf46624a', 'question', (SELECT id FROM projects WHERE title = 'Code the Future'), '2025-05-14T15:37:00'),
('0fc92eca-2523-4ffb-b819-75b3252140ec', 'What is the long-term impact of this project?', '55499a3c-f7d8-492b-a790-4223f29467b1', 'question', (SELECT id FROM projects WHERE title = 'Emergency Response Fund'), '2025-05-14T15:40:00'),
('ff265a02-4395-424c-9063-7cd79b62cd46', 'How can contributors help in this initiative?', '55499a3c-f7d8-492b-a790-4223f29467b1', 'question', (SELECT id FROM projects WHERE title = 'Emergency Response Fund'), '2025-05-14T15:42:00'),
('f95363bf-d9b8-499a-999f-ea9da4bf3465', 'What is the long-term impact of this project?', '08bf1aed-8822-4d99-84ae-f89fcf46624a', 'question', (SELECT id FROM projects WHERE title = 'Civic Leadership Lab'), '2025-05-14T15:45:00'),
('6b7812af-e424-4082-9d06-6cf7b5305bce', 'How can contributors help in this initiative?', 'c124b016-bab9-4904-8e1a-c38b8623001b', 'question', (SELECT id FROM projects WHERE title = 'Civic Leadership Lab'), '2025-05-14T15:47:00');

-- Insert answers to previously inserted questions
INSERT INTO comments (id, content, author_id, type, project_id, parent_comment_id, created_at)
VALUES
('bbf28695-28c1-4077-adc3-68fb5a2fdfcd', 'This project aims to increase literacy and educational opportunities in underserved regions, leading to generational empowerment.', 'fba413a5-05f1-4c79-9fd2-b0b67e3e1fb0', 'answer', (SELECT id FROM projects WHERE title = 'Empowering Education'), 'bbc150c3-3524-492f-89fd-bae7ed410518', '2025-05-14T15:04:00'),
('af29e005-7172-4003-b841-9af45c76d655', 'In the long run, we hope to regenerate native forests, improve biodiversity, and mitigate climate change in local ecosystems.', 'bcc18c37-3a33-4585-9af0-0e163cbb3850', 'answer', (SELECT id FROM projects WHERE title = 'Forest Restoration Initiative'), '18960f4d-efb5-47f7-947f-ee00c5b7b2a8', '2025-05-14T15:09:00'),
('515e92c9-4312-43ec-aefb-8fc88ae8c4b6', 'The long-term goal is to establish a sustainable healthcare network that reduces preventable deaths and ensures medical equity.', '0876de6c-f9ad-4ba2-b4a3-725ddbb8d498', 'answer', (SELECT id FROM projects WHERE title = 'Universal Health Access'), '82da46ab-68e7-45d6-8bea-4e3e8a938906', '2025-05-14T15:14:00'),
('b042715a-c28e-4a1e-a5fd-3702271c8b6c', 'This initiative will provide continuous access to clean drinking water, which will improve health and reduce disease in remote areas.', '31738359-04ef-418d-a6e5-59e9de312dab', 'answer', (SELECT id FROM projects WHERE title = 'Clean Water for Life'), '30d91aab-6793-4fa4-ad94-b9864b39d30d', '2025-05-14T15:19:00'),
('8842b7dd-b4a8-4e97-8f55-da82c56880d1', 'We envision a future with a strong animal welfare system that reduces neglect and increases community responsibility for animals.', 'e3cb1263-0e79-4fd5-be41-d1aa76f03bdc', 'answer', (SELECT id FROM projects WHERE title = 'Animal Rescue Network'), '2a18b402-90dc-4e79-a278-4a13b8a06b42', '2025-05-14T15:24:00'),
('e1009ea4-930a-43ed-a817-dd4f42d203de', 'Our long-term goal is to destigmatize mental health and make therapy and emotional support accessible to vulnerable populations.', '51fdcab5-7789-429d-bb3b-844139921e84', 'answer', (SELECT id FROM projects WHERE title = 'Mindful Support'), '8d3fee7e-91c5-4c7f-a7bf-6d8ebe5ce951', '2025-05-14T15:29:00'),
('628da6d1-2fbe-440a-99c2-1434b15bff28', 'Over time, this project will create a platform where marginalized voices are amplified through art, driving social and political change.', 'ff517450-e235-477e-a058-a2a73608dd69', 'answer', (SELECT id FROM projects WHERE title = 'Artists for Social Impact'), 'a3eade33-d373-48c8-b481-2bf6971e9dea', '2025-05-14T15:34:00'),
('9603ddc3-5778-4299-8158-c2190f641b24', 'We''re building the foundation for a generation of tech-savvy youth who will drive innovation in their communities.', '8a3c9070-d0ea-44d4-94c6-1e12b6787b6c', 'answer', (SELECT id FROM projects WHERE title = 'Code the Future'), '647eac37-6041-4beb-a2ae-f10784998829', '2025-05-14T15:39:00'),
('75121793-98e8-49d7-a03e-c193b488494d', 'Our impact will be a faster, more coordinated response to disasters, minimizing harm and improving community resilience.', '1609aba1-bcbb-426b-ae57-456f02e16de7', 'answer', (SELECT id FROM projects WHERE title = 'Emergency Response Fund'), '0fc92eca-2523-4ffb-b819-75b3252140ec', '2025-05-14T15:44:00'),
('e0daece7-bd72-47c6-9a0e-fa4f3e24910c', 'In the long term, this initiative will cultivate future civic leaders and strengthen democratic engagement in local governments.', '2b0a69d6-f304-47d3-ab4c-1b0dd816adf3', 'answer', (SELECT id FROM projects WHERE title = 'Civic Leadership Lab'), 'f95363bf-d9b8-499a-999f-ea9da4bf3465', '2025-05-14T15:49:00');
