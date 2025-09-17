import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '~/components/base/alert-dialog'

type ConfirmRemoveMemberDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}

export function ConfirmRemoveMemberDialog({
	open,
	onOpenChange,
	onConfirm,
}: ConfirmRemoveMemberDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="bg-white">
				<AlertDialogHeader>
					<AlertDialogTitle>Remove member?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you no longer want to be a member of this project? You
						will lose access to the Project Management pages.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="gradient-btn text-white"
					>
						Remove
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
