# KindFi Integration & Usage Guide

## Table of Contents
- [UI Components](#ui-components)
  - [Basic UI Component Example](#1-basic-ui-component-example)
  - [Complex Integration Scenerio](#2-complex-integration-scenerio)
  - [State Management Example](#3-state-management-example)
  - [Form Handling Example](#4-form-handling-example)
- [Services Integration](#services-integration)
  - [KYC Service Integration](#1-kyc-service-integration)
  - [AI Service Integration](#2-ai-service-integration)
  - [Database Integration](#3-database-integration-supabase)

## UI Components

### 1. Basic UI Component Example

The KindFi web application, located in the apps/web directory, utilizes React for building user interfaces. To illustrate basic usage of UI components, consider the following example of a button component:


```tsx
// File: ~/components/base/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'text-blue-700',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background text-black hover:text-blue-700',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:gradient-border-btn',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);


Button.displayName = 'Button';

export { Button, buttonVariants };

```
### Usage 

```tsx
// File: ~/app/home/page.tsx
import { Button } from '~/components/base/button';

const Home = () => {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div>
      <h1>Welcome to KindFi</h1>
      <Button onClick={handleClick}>Click Me</Button>
    </div>
  );
};

export default Home;
```
In this example, the Button component is a reusable UI element that can be integrated into various parts of the application.

### 2. Complex Integration Scenerio
For more complex scenarios, such as integrating third-party libraries, the project employs components like react-dropzone for file uploads. The react-dropzone library provides a simple way to create an HTML5-compliant drag-and-drop zone for files. Documentation and examples are available at https://react-dropzone.js.org.

### Example
```tsx
// File: ~/components/sections/project/project-media.tsx
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '~/components/base/card';
import { Input } from '~/components/base/input';

interface ProjectMediaProps {
  onFileUpload: (file: File) => void;
  onVideoUrlChange: (url: string) => void;
  videoUrl?: string;
}

export function ProjectMedia({
  onFileUpload,
  onVideoUrlChange,
  videoUrl = '',
  onFileUpload,
  onVideoUrlChange,
  videoUrl = '',
}: ProjectMediaProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.size <= 10 * 1024 * 1024) {
        // 10MB limit
        onFileUpload(file);
      }
    },
    [onFileUpload],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-4">Media & Attachments</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Pitch Deck</h4>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop your pitch deck here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">PDF or PowerPoint, max 10MB</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Video URL</h4>
          <Input
            type="url"
            placeholder="Enter URL to your pitch video (YouTube, Vimeo, etc.)"
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">Optional: Add a video to enhance your pitch</p>
        </div>
      </div>
    </Card>
  );
}

```

### Usage

```tsx
// File: ~/app/projects/page.tsx
import { ProjectMedia } from '~/components/sections/project/project-media';

export default function ProjectsPage() {
  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
  };
  const handleVideoUrlChange = (url: string) => {
    console.log('Video URL updated:', url);
  };

  return (
    <div className="space-y-8">
      <ProjectMedia
        onFileUpload={handleFileUpload}
        onVideoUrlChange={handleVideoUrlChange}
      />
    </div>
  );
}
```

### 3. State Management Example 

For state management, KindFi uses React Context and server actions in Next.js 15. Here's an example:


```tsx
// File: ~/context/project-context.tsx
'use client';

import { createContext, useContext, useReducer } from 'react';

const initialState = {
  projects: [],
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    default:
      return state;
  }
};

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
```

### Usage with Server Action

Create a server action to fetch projects from your API.
```tsx
"use server";

export const fetchProjects = async () => {
  const response = await fetch(`${process.env.API_BASE_URL}/api/projects`);
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

```
Use Server Action in a Client Component
```tsx
// File: ~/app/projects/page.tsx
"use client"; 

import { useEffect, useState, useTransition } from "react";
import { useProject } from "~/context/project-context";
import { fetchProjects } from "./actions"; // Import the server action

export default function ProjectsPage(){
  const { state, dispatch } = useProject();
  const [loading, startTransition] = useTransition();

  useEffect(() => {
    if (state.projects.length === 0) {
      startTransition(async () => {
        try {
          const initialProjects = await fetchProjects();
          dispatch({ type: "SET_PROJECTS", payload: initialProjects });
        } catch (error) {
          console.error("Failed to fetch projects:", error);
        }
      });
    }
  }, [state.projects.length, dispatch]);

  return (
    <div>
      <h1>Projects</h1>
      {loading && <p>Loading projects...</p>}
      <ul>
        {state.projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
};

```
This approach ensures predictable state transitions and makes the application easier to debug and maintain.

### 4. Form Handling Example

For form handling, KindFi uses server actions in Next.js 15. Here's an example:

```tsx
// File: ~/components/forms/contribution-form.tsx
'use client';

import { useState } from 'react';

export default function ContributionForm({ onSubmit }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(amount);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Contribution Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <button type="submit">Contribute</button>
    </form>
  );
}
```

### Usage with Server Action

```tsx

// File: ~/app/projects/[id]/page.tsx
import ContributionForm from '~/components/forms/contribution-form';
export default function ProjectDetails() {
  const handleContribution = async (amount) => {
    'use server';
    console.log(`Contributed: ${amount}`);
  };

  return (
    <div>
      <h1>Project Details</h1>
      <ContributionForm onSubmit={handleContribution} />
    </div>
  );
}
 
```

## Service Integration
### 1. KYC Service Integration

```tsx
// File: ~/services/kyc.ts
export const submitKYC = async (baseUrl: string, data: any) => {
  const formData = new FormData();
  formData.append('userId', data.userId);
  formData.append('documentType', data.documentType);
  formData.append('documentFront', data.documentFront);
  if (data.documentBack) formData.append('documentBack', data.documentBack);
  formData.append('selfie', data.selfie);

  const response = await fetch(`${baseUrl}/kyc/submit`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('KYC submission failed');
  return response.json();
};

export const checkKYCStatus = async (baseUrl: string, verificationId: string) => {
  const response = await fetch(`${baseUrl}/kyc/status/${verificationId}`);
  if (!response.ok) throw new Error('Failed to check KYC status');
  return response.json();
};
```

### 2. AI Service Integration
```tsx
// File: ~/services/ai.ts
interface AICampaignAnalysis {
  riskScore: number;
  categoryPrediction: string;
  suggestedImprovements: string[];
}

export const analyzeCampaign = async (
  baseUrl: string,
  apiKey: string,
  campaignData: { title: string; description: string; goals: string[] },
): Promise<AICampaignAnalysis> => {
  const response = await fetch(`${baseUrl}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(campaignData),
  });

  if (!response.ok) throw new Error('Campaign analysis failed');
  return response.json();
};
```

### 3. Database Integration (Supabase)

```tsx
// File: ~/services/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  creator_id: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseKey);
};

export const createCampaign = async (
  supabase: SupabaseClient,
  campaign: Omit<Campaign, 'id' | 'created_at'>,
) => {
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
  if (error) throw error;
  return data;
};

export const getCampaign = async (supabase: SupabaseClient, id: string) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, creator:profiles(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const updateCampaign = async (
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Campaign>,
) => {
  const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};
```