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
// File: apps/web/components/base/button.tsx
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			/** Defines different button visual styles */
			variant: {
				default: 'text-blue-700',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background text-black hover:text-blue-700',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:gradient-border-btn',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			/** Defines the button's size */
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		/** Default variants if no props are provided */
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		)
	},
)

Button.displayName = 'Button'

export { Button, buttonVariants }

```
### Usage 

```tsx
// File: apps/web/app/home/page.tsx

import React from 'react';
import Button from '~/components/base/button';

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
'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '../../base/card'
import { Input } from '../../base/input'

interface ProjectMediaProps {
	onFileUpload: (file: File) => void
	onVideoUrlChange: (url: string) => void
	videoUrl?: string
}

export function ProjectMedia({
	onFileUpload,
	onVideoUrlChange,
	videoUrl = '',
}: ProjectMediaProps) {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0]
			if (file && file.size <= 10 * 1024 * 1024) {
				// 10MB limit
				onFileUpload(file)
			}
		},
		[onFileUpload],
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/pdf': ['.pdf'],
			'application/vnd.openxmlformats-officedocument.presentationml.presentation':
				['.pptx'],
		},
		maxFiles: 1,
		maxSize: 10 * 1024 * 1024, // 10MB
	})

	return (
		<Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
			<h3 className="text-xl font-semibold mb-4">Media & Attachments</h3>
			<div className="space-y-6">
				<div>
					<h4 className="font-medium mb-2">Pitch Deck</h4>
					<div
						{...getRootProps()}
						className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
							isDragActive
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300 hover:border-gray-400'
						}`}
					>
						<input {...getInputProps()} />
						<p className="text-gray-600">
							{isDragActive
								? 'Drop the file here...'
								: 'Drag & drop your pitch deck here, or click to select'}
						</p>
						<p className="text-sm text-gray-500 mt-1">
							PDF or PowerPoint, max 10MB
						</p>
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
					<p className="text-sm text-gray-500 mt-1">
						Optional: Add a video to enhance your pitch
					</p>
				</div>
			</div>
		</Card>
	)
}

```

### Usage

```tsx
import { ProjectMedia } from '../../../../../components/sections/project/project-media'


export function page() {
    	const handleFileUpload = (file: File) => {
		// TODO: Implement file upload
		console.log('File uploaded:', file.name)
	}

	const handleVideoUrlChange = (url: string) => {
		// TODO: Implement video URL update
		console.log('Video URL updated:', url)
	}

	return (
			<div className="space-y-8">
				<ProjectMedia
                    onFileUpload={handleFileUpload}
                    onVideoUrlChange={handleVideoUrlChange}
                />
            </div>
	)
}
```

### 3. State Management Example 

*(Using Context)*

State management in the KindFi web application is handled using React's built-in useState and useReducer hooks. For global state management, consider integrating a state management library like Redux or Context API.

*Example using* `useReducer`:

```tsx
export const initialState = {
  projects: [],
};

export const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    default:
      return state;
  }
};
```

### Usage 

```tsx

import React, { useReducer, useEffect } from 'react';
import { initialState, projectReducer } from '../reducers/projectReducer';

const Projects = () => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  useEffect(() => {
    // Fetch projects from API
    fetch('/api/projects')
      .then((response) => response.json())
      .then((data) => {
        dispatch({ type: 'SET_PROJECTS', payload: data });
      });
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {state.projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
```
This approach ensures predictable state transitions and makes the application easier to debug and maintain.

### 4. Form Handling Example

Form handling is a crucial aspect of web applications. In KindFi, forms are managed using controlled components and, for more complex forms, libraries like formik can be utilized.

*Example using* `controlled components:`

```tsx
import React, { useState } from 'react';

const ContributionForm = ({ onSubmit }) => {
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
};

export default ContributionForm;
```

### Usage 

```tsx

import React from 'react';
import ContributionForm from '../components/ContributionForm';

const ProjectDetails = () => {
  const handleContribution = (amount) => {
    // Process contribution
    console.log(`Contributed: ${amount}`);
  };

  return (
    <div>
      <h1>Project Details</h1>
      <ContributionForm onSubmit={handleContribution} />
    </div>
  );
};

export default Project
::contentReference[oaicite:0]{index=0}
 
```

## Service Integration
### 1. KYC Service Integration

```tsx
const submitKYC = async (baseUrl, data) => {
  try {
    const formData = new FormData();
    formData.append('userId', data.userId);
    formData.append('documentType', data.documentType);
    formData.append('documentFront', data.documentFront);
    if (data.documentBack) {
      formData.append('documentBack', data.documentBack);
    }
    formData.append('selfie', data.selfie);

    const response = await fetch(`${baseUrl}/kyc/submit`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('KYC submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('KYC submission error:', error);
    throw error;
  }
};

const checkKYCStatus = async (baseUrl, verificationId) => {
  try {
    const response = await fetch(`${baseUrl}/kyc/status/${verificationId}`);

    if (!response.ok) {
      throw new Error('Failed to check KYC status');
    }

    return await response.json();
  } catch (error) {
    console.error('KYC status check error:', error);
    throw error;
  }
};

export { submitKYC, checkKYCStatus };
```

### 2. AI Service Integration
```tsx
interface AICampaignAnalysis {
  riskScore: number;
  categoryPrediction: string;
  suggestedImprovements: string[];
}

const analyzeCampaign = async (baseUrl: string, apiKey: string, campaignData: {
  title: string;
  description: string;
  goals: string[];
}): Promise<AICampaignAnalysis> => {
  try {
    const response = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(campaignData)
    });

    if (!response.ok) {
      throw new Error('Campaign analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
};

export { analyzeCampaign };

```

### 3. Database Integration (Supabase)

```tsx
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

const createSupabaseClient = (supabaseUrl: string, supabaseKey: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseKey);
};

const createCampaign = async (
  supabase: SupabaseClient,
  campaign: Omit<Campaign, 'id' | 'created_at'>
) => {
  try {
    const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getCampaign = async (supabase: SupabaseClient, id: string) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, creator:profiles(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const updateCampaign = async (
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Campaign>
) => {
  try {
    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

export { createSupabaseClient, createCampaign, getCampaign, updateCampaign };
```