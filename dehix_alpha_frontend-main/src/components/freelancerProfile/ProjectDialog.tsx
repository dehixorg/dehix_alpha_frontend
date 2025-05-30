import React from 'react';
import {
  Calendar,
  Github,
  ExternalLink,
  Wrench,
  Tag,
  UserCheck,
} from 'lucide-react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DialogProps {
  dialog: any;
  setDialog: (dialog: any) => void;
}

const ProjectDialog: React.FC<DialogProps> = ({ dialog, setDialog }) => {
  return (
    <Dialog open={Boolean(dialog)} onOpenChange={() => setDialog(null)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg"></Button>
      </DialogTrigger>

      <DialogContent className="max-w-[800px] w-full h-[86vh] rounded-2xl p-6 overflow-hidden flex flex-col">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <DialogTitle className="text-3xl font-bold">
              {dialog.projectName}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Detailed information about the project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {[
            { label: 'Project Name', value: dialog.projectName },
            dialog.description && {
              label: 'Description',
              value: dialog.description,
            },
            dialog.role && {
              icon: <UserCheck className="w-5 h-5 " />,
              label: 'Role',
              value: dialog.role,
            },
            dialog.techUsed?.length > 0 && {
              icon: <Wrench className="w-5 h-5 " />,
              label: 'Tech Used',
              value: dialog.techUsed.join(', '),
            },
            dialog.githubLink && {
              icon: <Github className="w-5 h-5 " />,
              label: 'GitHub Link',
              value: (
                <a
                  href={dialog.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gray-600 hover:underline"
                >
                  <ExternalLink size={18} />
                </a>
              ),
              isLink: true,
            },
            dialog.projectType && {
              icon: <Tag className="w-5 h-5 " />,
              label: 'Project Type',
              value: dialog.projectType,
            },
            dialog.start &&
              dialog.end && {
                icon: <Calendar className="w-5 h-5 " />,
                label: 'Project Duration',
                value: (
                  <div className="flex gap-4 mt-1 items-center">
                    <Badge className="px-3 py-1 rounded-lg ">
                      {new Date(dialog.start).toLocaleDateString()}
                    </Badge>
                    <span className="font-semibold">→</span>
                    <Badge className="px-3 py-1 rounded-lg ">
                      {new Date(dialog.end).toLocaleDateString()}
                    </Badge>
                  </div>
                ),
              },
          ]
            .filter(Boolean)
            .map((item, index) => (
              <div key={index} className="flex items-start gap-6">
                {item.icon && <div>{item.icon}</div>}
                <div
                  className={`flex ${item.isLink ? 'flex-row gap-2' : 'flex-col'}`}
                >
                  <h3 className="text-sm font-medium ">{item.label}</h3>
                  <p className="text-base font-semibold ">{item.value}</p>
                </div>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
