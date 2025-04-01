interface MilestoneData {
    completionDate: string;
    estimatedDate: string;
    description: string;
  }
  
  interface ProjectMilestoneProps {
    index: number;
    projectId: string | number;
    completedMilestones?: number;
    milestoneData?: MilestoneData;
  }
  
  const ProjectMilestone: React.FC<ProjectMilestoneProps> = ({ 
    index, 
    projectId, 
    completedMilestones = 0, 
    milestoneData = { 
      completionDate: 'January 15, 2025', 
      estimatedDate: 'June 30, 2025', 
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' 
    } 
  }) => {
    const isCompleted = index < completedMilestones;
    
    return (
      <div
        key={`milestone-${index}-${projectId}`}
        className={`p-4 rounded-lg border ${
          isCompleted
            ? 'bg-green-50 border-green-200'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-start">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
              isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {isCompleted ? '✓' : index + 1}
          </div>
          <div>
            <h4 className="font-medium">
              Milestone {index + 1}
            </h4>
            <p className="text-sm text-gray-600">
              {isCompleted
                ? `Completed on ${milestoneData.completionDate}`
                : `Estimated completion: ${milestoneData.estimatedDate}`}
            </p>
            <p className="mt-2">
              {milestoneData.description}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProjectMilestone;