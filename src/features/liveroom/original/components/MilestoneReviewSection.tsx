import React, { useState, useEffect } from 'react';
import { PackageOpen, Sparkles, CheckCircle } from 'lucide-react';
import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import StoriesSection from '@/components/shared/StoriesSection';
import { Milestone, Story, MilestoneStatus } from '@/utils/types/Milestone';
import { Button } from '@/components/ui/button';

interface MilestoneReviewSectionProps {
  blueprint: Record<string, any>;
  onApproveAndFindTalent: () => void;
  onBack: () => void;
  isFindingTalent: boolean;
}

const MilestoneReviewSection: React.FC<MilestoneReviewSectionProps> = ({
  blueprint,
  onApproveAndFindTalent,
  onBack,
  isFindingTalent,
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(0);

  useEffect(() => {
    // Parse milestones from the blueprint
    // We expect them to be in blueprint.development_roadmap.phases or similar
    const extractedMilestones: Milestone[] = [];
    
    // Look for roadmap data in various common blueprint keys
    let rawPhases: any[] = [];
    const possibleKeys = ['development_roadmap', 'roadmap', 'milestones', 'phases'];
    
    for (const key of possibleKeys) {
      if (blueprint[key]) {
        const val = blueprint[key];
        if (Array.isArray(val)) {
          rawPhases = val;
          break;
        } else if (typeof val === 'object' && val !== null) {
          if (Array.isArray(val.phases)) {
            rawPhases = val.phases;
            break;
          } else if (Array.isArray(val.steps)) {
            rawPhases = val.steps;
            break;
          } else {
            // It might be an object where values are phases
            rawPhases = Object.values(val).filter(v => typeof v === 'object' && v !== null);
            if (rawPhases.length > 0) break;
          }
        }
      }
    }
    
    if (rawPhases.length > 0) {
      rawPhases.forEach((p, idx) => {
        // Create dummy stories/tasks based on deliverables
        const deliverables = p.deliverables || p.tasks || p.milestones || p.key_tasks || [];
        
        const stories: Story[] = Array.isArray(deliverables) ? deliverables.map((d: any, dIdx: number) => ({
          _id: `story-${idx}-${dIdx}`,
          title: typeof d === 'string' ? d : (d.title || d.name || d.task || `Task ${dIdx + 1}`),
          summary: typeof d === 'string' ? '' : (d.description || d.purpose || ''),
          storyStatus: 'NOT_STARTED',
          importantUrls: [],
          tasks: []
        })) : [];

        extractedMilestones.push({
          _id: `milestone-${idx}`,
          title: p.phase_name || p.name || p.title || `Phase ${idx + 1}`,
          description: p.description || p.purpose || p.duration || '',
          amount: 0,
          status: MilestoneStatus.NOT_STARTED,
          startDate: { expected: new Date().toISOString() },
          endDate: { expected: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
          stories: stories
        } as Milestone);
      });
    }

    setMilestones(extractedMilestones);
  }, [blueprint]);

  // Keep selected index within bounds
  useEffect(() => {
    if (milestones.length === 0) return;
    if (selectedMilestoneIndex == null || selectedMilestoneIndex >= milestones.length) {
      setSelectedMilestoneIndex(0);
    }
  }, [milestones, selectedMilestoneIndex]);

  // Mock handlers since we don't save to backend yet
  const fetchMilestones = () => {};
  
  const handleStorySubmit = async (
    e: React.FormEvent,
    storyData: Story,
    updateMilestone: Milestone,
    isTask = false,
    newTask: any = null
  ) => {
    e.preventDefault();
    // Local state update only for review phase
    setMilestones(prev => prev.map(m => {
      if (m._id === updateMilestone._id) {
        let updatedStories = m.stories || [];
        if (isTask && newTask) {
          updatedStories = updatedStories.map(story => {
            if (story._id === newTask.storyId) {
              return {
                ...story,
                tasks: [...(story.tasks || []), newTask.formData]
              };
            }
            return story;
          });
        } else {
          updatedStories = [...updatedStories, storyData];
        }
        return { ...m, stories: updatedStories };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/10 pb-4">
          <div>
            <div className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
              Phase 3 output
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Milestones Review</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve the generated milestones before proceeding to talent selection.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isFindingTalent}
            >
              Back to Blueprint
            </Button>
            <Button
              onClick={onApproveAndFindTalent}
              disabled={isFindingTalent || milestones.length === 0}
              className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/25 font-bold"
            >
              {isFindingTalent ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Finding Talent...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Find Talent
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-card/40 border border-border/40 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm relative">
          <div className="p-6">
            {milestones.length > 0 ? (
              <div className="flex flex-col gap-6 w-full max-w-full">
                <div className="w-full">
                  <MilestoneTimeline
                    fetchMilestones={fetchMilestones}
                    milestones={milestones}
                    handleStorySubmit={handleStorySubmit}
                    selectedIndex={selectedMilestoneIndex}
                    onMilestoneSelect={(index) => setSelectedMilestoneIndex(index)}
                  />
                </div>

                {selectedMilestoneIndex !== null && (
                  <div className="w-full mt-4">
                    <StoriesSection
                      key={milestones[selectedMilestoneIndex]?._id ?? selectedMilestoneIndex}
                      milestone={milestones[selectedMilestoneIndex]}
                      fetchMilestones={fetchMilestones}
                      handleStorySubmit={handleStorySubmit}
                      isFreelancer={false}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[40vh] w-full">
                <div className="text-center">
                  <PackageOpen className="mx-auto text-muted-foreground/50 mb-4" size="64" />
                  <p className="text-muted-foreground font-medium">No milestones generated in blueprint</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">Try updating your blueprint roadmap</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneReviewSection;
