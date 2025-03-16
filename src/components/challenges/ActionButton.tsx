
import { useState } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActionButtonProps {
  id: number;
}

export default function ActionButton({ id }: ActionButtonProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { challenges, updateChallenge, deleteChallenge, setActiveChallenge } = useChallengeStore();
  
  const challenge = challenges.find(c => c.id === id);
  
  if (!challenge) return null;
  
  const handleToggleActive = async () => {
    await updateChallenge(id, { is_active: !challenge.is_active });
  };
  
  const handleSetActive = () => {
    setActiveChallenge(challenge);
  };
  
  const handleDelete = async () => {
    await deleteChallenge(id);
    setIsDeleteAlertOpen(false);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4 text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-zinc-800">
          <DropdownMenuItem onClick={handleSetActive} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>Set Active</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive} className="cursor-pointer">
            {challenge.is_active ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                <span>Activate</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteAlertOpen(true)}
            className="text-challenge cursor-pointer focus:text-challenge"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{challenge.title}" challenge and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-challenge hover:bg-challenge/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
