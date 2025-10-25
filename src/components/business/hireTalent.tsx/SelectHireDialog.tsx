import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

interface HireOption {
  id: string;
  title: string;
  business_req_talent_id: string;
  type?: 'skill' | 'domain';
  experience?: string;
  status?: string;
}

interface SelectHireDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (hireId: string, businessReqTalentId: string) => void;
  businessId: string;
}

export function SelectHireDialog({
  isOpen,
  onClose,
  onSelect,
  businessId,
}: SelectHireDialogProps) {
  const [hires, setHires] = useState<HireOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHire, setSelectedHire] = useState<string>('');
  const [selectedBusinessReqTalentId, setSelectedBusinessReqTalentId] =
    useState<string>('');

  useEffect(() => {
    const fetchHires = async () => {
      try {
        setIsLoading(true);

        // Fetch hire data from the /business/hire-dehixtalent endpoint
        const response = await axiosInstance.get('/business/hire-dehixtalent');

        if (response?.data?.data) {
          // Transform the data to match the HireOption interface
          const hireOptions = response.data.data
            .filter((item: any) => item.visible !== false) // Only include visible items
            .map((item: any) => ({
              id: item._id,
              title:
                item.skillName ||
                item.domainName ||
                item.talentName ||
                'Unnamed Hire',
              business_req_talent_id:
                item.talentId || item.skillId || item.domainId || item._id,
              type: item.skillName ? 'skill' : 'domain',
              experience: item.experience,
              status: item.status,
            }));

          setHires(hireOptions);
        } else {
          throw new Error('No data in response');
        }
      } catch (error) {
        console.error('Error fetching hires:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load hire data. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchHires();
    }
  }, [isOpen]);

  const handleSelect = () => {
    if (selectedHire && selectedBusinessReqTalentId) {
      onSelect(selectedHire, selectedBusinessReqTalentId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Hire</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {hires.length > 0 ? (
                hires.map((hire) => (
                  <div
                    key={hire.id}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedHire === hire.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHire(hire.id);
                      setSelectedBusinessReqTalentId(
                        hire.business_req_talent_id,
                      );
                    }}
                  >
                    <div className="font-medium">{hire.title}</div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{hire.type?.toUpperCase()}</span>
                      {hire.experience && (
                        <span>Exp: {hire.experience} yrs</span>
                      )}
                      {hire.status && <span>Status: {hire.status}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hires found. Please create a hire first.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect();
                }}
                disabled={!selectedHire || !selectedBusinessReqTalentId}
              >
                Select
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
