import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from 'lucide-react';

const AddToLobbyDialog = ({
  skillDomainData = [],
  currSkills = [],
  handleAddSkill,
  handleDeleteSkill,
  handleAddToLobby,
  talent,
  setTmpSkill,
  tmpSkill,
  open,
  setOpen,
  isLoading
}: any) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Skills to Lobby</DialogTitle>
        </DialogHeader>

        <div className=" mt-2">
          <div className="flex items-center gap-2">
            <Select
              value={tmpSkill || ''}
              onValueChange={(value) => setTmpSkill(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select skill">
                  {tmpSkill || null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {skillDomainData
                  .filter((skill: any) => !currSkills.some((s: any) => s.name === skill.label))
                  .map((skill: any, index: any) => (
                    <SelectItem key={index} value={skill.label}>
                      {skill.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                handleAddSkill();
                setTmpSkill('');
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>


          <div className="flex flex-wrap gap-2 mt-4">
            {currSkills.map((skill: any, index: number) => (
              <Badge
                key={index}
                className="uppercase text-xs font-normal bg-gray-300 flex items-center px-2 py-1"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(skill.name)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={() => {
              handleAddToLobby(talent.freelancer_id);
            }}
            className="w-full text-sm py-1 px-2 text-black rounded-md"
            type="submit"
          >
            {isLoading ? <Loader2 className='animate-spin' /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToLobbyDialog;
