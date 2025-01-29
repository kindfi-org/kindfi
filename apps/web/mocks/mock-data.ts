export const statsData = [
    { label: "Contribution", value: "$100", bgColor: "bg-blue-100", textColor: "text-blue-700", icon: "💰" },
    { label: "NFT Earned", value: "1", bgColor: "bg-purple-100", textColor: "text-purple-700", icon: "🏆" },
    { label: "Referrals", value: "2", bgColor: "bg-green-100", textColor: "text-green-700", icon: "👥" },
  ];
  
  export const updatesData = [
    {
      title: "Behind the Scenes Update #1",
      description: "Exclusive project insights and progress updates...",
      date: "2 days ago",
      exclusive: true,
    },
    {
      title: "Behind the Scenes Update #2",
      description: "Exclusive project insights and progress updates...",
      date: "2 days ago",
      exclusive: true,
    },
  ];
  
  export const statsDataUpdates = [
    { label: "Total Raised", value: "$100,000", bgColor: "bg-blue-100", textColor: "text-blue-700", icon: "💰" },
    { label: "Supporters", value: "234", bgColor: "bg-purple-100", textColor: "text-purple-700", icon: "👥" },
    { label: "NFTs Minted", value: "156", bgColor: "bg-green-100", textColor: "text-green-700", icon: "🏆" },
  ];
  
  export const timelineEvents = [
    { title: "Project Launch", date: "Mar 15", status: "completed" as const },
    { title: "50% Milestone", date: "Apr 1", status: "completed" as const },
    { title: "Goal Reached", date: "Apr 15", status: "completed" as const },
    { title: "Implementation", date: "May 1", status: "pending" as const },
  ];
  
  export const successGalleryItems = [
    { src: "/images/image.png", alt: "Success 1" },
    { src: "/images/image.png", alt: "Success 2" },
    { src: "/images/image.png", alt: "Success 3" },
  ];
  
  export const showcaseData = [
    { src: "/images/image.png", alt: "Image 1", type: "image" },
    { src: "/images/image.png", alt: "Image 2", type: "image" },
    { src: "/images/image.png", alt: "Image 3", type: "image" },
    { src: "/images/image.png", alt: "Image 4", type: "image" },
    { src: "/images/image.png", alt: "Image 5", type: "image" },
    { src: "/images/image.png", alt: "Image 6", type: "image" },
    { src: "/images/image.png", alt: "Image 7", type: "image" },
    { src: "/images/image.png", alt: "Image 8", type: "image" },
    { src: "/images/image.png", alt: "Image 9", type: "image" },
    { src: "/images/image.png", alt: "Image 10", type: "image" },
    { src: "/images/image.png", alt: "Image 11", type: "image" },
    { src: "/images/image.png", alt: "Image 12", type: "image" },
  ];
  
  export const mediaItems = [
    { src: "/images/video.png", alt: "Main Video" },
    { src: "/images/image.png", alt: "Thumbnail 1" },
    { src: "/images/image.png", alt: "Thumbnail 2" },
    { src: "/images/image.png", alt: "Thumbnail 3" },
    { src: "/images/image.png", alt: "Thumbnail 4" },
  ];

  export const projectOverviewMediaItems = [
    { src: "/images/video.png", alt: "Main Video" },

  ];
  
  export const aboutProjectProps = {
    description:
      "Detailed project description would go here, explaining the goals, impact, and importance of the initiative...",
    highlights: [
      { label: "Goal", value: "Clear environmental impact", icon: "target" },
      { label: "Community", value: "500+ supporters", icon: "user" },
      { label: "Location", value: "Global Initiative", icon: "language" },
      { label: "Verification", value: "Verified by KindFi", icon: "status" },
    ],
    updates: [
      {
        title: "Project Milestone 1",
        description: "Brief update about project progress and achievements...",
        date: "2 days ago",
      },
      {
        title: "Project Milestone 2",
        description: "Brief update about project progress and achievements...",
        date: "2 days ago",
      },
    ],
    titleAboveHighlights: true,
  };
  
  export interface NFTTier {
    title: string
    support: string
    left: number
}

export interface NFTCollection {
    title: string
    id: string
    rarity: string
}

export interface Comment {
    name: string
    badge: string
    comment: string
    likes: number
}

export const nftTiers: NFTTier[] = [
    { title: 'Early Bird', support: 'Support $50+', left: 100 },
    { title: 'Impact Maker', support: 'Support $100+', left: 50 },
    { title: 'Project Champion', support: 'Support $500+', left: 10 },
]

export const nftCollection: NFTCollection[] = [
    { title: 'Early Bird', id: '#042', rarity: 'Rare' },
    { title: 'Impact Maker', id: '#021', rarity: 'Epic' },
    { title: 'Project Champion', id: '#007', rarity: 'Legendary' },
]

export const comments: Comment[] = [
    {
        name: 'Sarah M.',
        badge: 'Early Supporter',
        comment: 'Amazing to see the project reach its goal! The community really came together. 🎉',
        likes: 24,
    },
    {
        name: 'David K.',
        badge: 'Project Champion',
        comment: 'The transparency and regular updates made this journey special. Looking forward to the impact report! 📊',
        likes: 18,
    },
]

  