-- Create the project table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    target_amount DECIMAL(12, 2) NOT NULL,
    min_investment DECIMAL(12, 2) NOT NULL,
    percentage_complete DECIMAL(5, 2) NOT NULL DEFAULT 0,
    investors_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category_id UUID REFERENCES public.categories(id),
    image_url TEXT,
    owner_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Create the project_tags junction table
CREATE TABLE public.project_tags (
    project_id UUID REFERENCES public.projects(id),
    tag_id UUID REFERENCES public.tags(id),
    PRIMARY KEY (project_id, tag_id)
);

-- Create the project_updates table
CREATE TABLE public.project_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the project_investors table
CREATE TABLE public.project_investors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id),
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(12, 2) NOT NULL,
    invested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_min_investment CHECK (amount >= (
        SELECT min_investment 
        FROM public.projects 
        WHERE id = project_id
    ))
);

-- Add necessary indices
CREATE INDEX idx_projects_category_id ON public.projects(category_id);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_project_tags_project_id ON public.project_tags(project_id);
CREATE INDEX idx_project_tags_tag_id ON public.project_tags(tag_id);
CREATE INDEX idx_project_updates_project_id ON public.project_updates(project_id);
CREATE INDEX idx_project_investors_project_id ON public.project_investors(project_id);
CREATE INDEX idx_project_investors_user_id ON public.project_investors(user_id);

-- Set up RLS policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_investors ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects table
CREATE POLICY "Allow public read access to projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);

CREATE POLICY "Allow project owners to update their projects" ON public.projects
    FOR UPDATE USING (auth.uid() = owner_id);

-- RLS policies for project_tags table
CREATE POLICY "Allow public read access to project tags" ON public.project_tags
    FOR SELECT USING (true);

CREATE POLICY "Allow project owners to manage project tags" ON public.project_tags
    FOR ALL USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_tags.project_id));

-- RLS policies for project_updates table
CREATE POLICY "Allow public read access to project updates" ON public.project_updates
    FOR SELECT USING (true);

CREATE POLICY "Allow project owners to manage project updates" ON public.project_updates
    FOR ALL USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_updates.project_id));

-- RLS policies for project_investors table
CREATE POLICY "Allow public read access to project investors" ON public.project_investors
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to invest in projects" ON public.project_investors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view their own investments" ON public.project_investors
    FOR SELECT USING (auth.uid() = user_id);

-- Create a function to update the projects table when a new investment is made
CREATE OR REPLACE FUNCTION public.update_project_on_investment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.projects
    SET 
        current_amount = current_amount + NEW.amount,
        percentage_complete = LEAST((current_amount + NEW.amount) / target_amount * 100, 100),
        investors_count = investors_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new investment is made
CREATE TRIGGER update_project_on_investment_trigger
AFTER INSERT ON public.project_investors
FOR EACH ROW
EXECUTE FUNCTION public.update_project_on_investment();

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp for projects
CREATE TRIGGER update_projects_modtime
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

-- Add constraints
ALTER TABLE public.projects
ADD CONSTRAINT check_positive_target_amount CHECK (target_amount > 0);

ALTER TABLE public.projects
ADD CONSTRAINT check_min_investment_less_than_target CHECK (min_investment <= target_amount);