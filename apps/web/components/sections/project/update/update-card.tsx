"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Heart, MessageSquare, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarImage } from "~/components/base/avatar";
import { Badge } from "~/components/base/badge";
import { Button } from "~/components/base/button";
import { Card, CardContent } from "~/components/base/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/base/alert-dialog";
import { UpdateForm } from "./update-form";
import { formatDistanceToNow } from "date-fns";

interface UpdateCardProps {
  data: any[];
  updatesUrl: string;
  canManageUpdates?: boolean;
  onEdit?: (id: string, data: { title: string; description: string }) => void;
  onDelete?: (id: string) => void;
}

export function UpdateCard({
  data,
  updatesUrl,
  canManageUpdates = false,
  onEdit,
  onDelete,
}: UpdateCardProps) {
  const [expandedOptions, setExpandedOptions] = useState<string | null>(null);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null);

  const toggleOptions = (updateId: string) => {
    setExpandedOptions(expandedOptions === updateId ? null : updateId);
  };

  const handleEdit = (update) => {
    setEditingUpdateId(update.id);
    setExpandedOptions(null);
  };

  const handleDelete = (updateId: string) => {
    setDeletingUpdateId(updateId);
    setExpandedOptions(null);
  };

  const confirmDelete = () => {
    if (deletingUpdateId && onDelete) {
      onDelete(deletingUpdateId);
      setDeletingUpdateId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Updates</h2>
        <Link href={updatesUrl}>
          <Button className="text-xl font-bold">{data.length} updates</Button>
        </Link>
      </div>

      {editingUpdateId && (
        <UpdateForm
          update={data.find((update) => update.id === editingUpdateId)}
          onSubmit={(formData) => {
            if (onEdit) {
              onEdit(editingUpdateId, formData);
              setEditingUpdateId(null);
            }
          }}
          onCancel={() => setEditingUpdateId(null)}
          isSubmitting={false}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.length > 0 ? (
          data.map((update) => (
            <Card key={update.id} className="overflow-hidden border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="flex items-center gap-4">
                    {update.is_featured && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 font-bold hover:bg-blue-200"
                      >
                        Featured
                      </Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        className="flex items-center gap-1 text-gray-600"
                        aria-label={`Like this update (${update.likes || 0} likes)`}
                      >
                        <Heart className="h-5 w-5" />
                        <span>{update.likes || 0}</span>
                      </Button>
                      <Button
                        size="icon"
                        className="flex items-center gap-1 text-gray-600"
                        aria-label={`View comments (${update.comments || 0} comments)`}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{update.comments || 0}</span>
                      </Button>
                    </div>
                  </div>
                  {canManageUpdates && (
                    <Button
                      size="icon"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => toggleOptions(update.id)}
                      aria-label="Toggle additional options"
                      aria-expanded={expandedOptions === update.id}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                {expandedOptions === update.id && (
                  <div className="absolute right-6 top-16 z-10 p-3 bg-white shadow-md rounded-md border border-gray-200">
                    <h4 className="font-semibold mb-2">Options</h4>
                    <Button
                      variant="outline"
                      className="mr-2 flex items-center gap-2"
                      onClick={() => handleEdit(update)}
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 flex items-center gap-2"
                      onClick={() => handleDelete(update.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-4">{update.title}</h3>

                <div className="flex items-center gap-3 my-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        update.user?.avatar_url ||
                        "/placeholder.svg?height=40&width=40"
                      }
                      alt={update.user?.name || "User"}
                    />
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {update.user?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(update.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {update.description ||
                    "No description available for this update."}
                </p>
                <Link href={`${updatesUrl}/${update.id}`}>
                  <Button variant="outline" className="w-full">
                    Read more
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No updates available yet.</p>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deletingUpdateId}
        onOpenChange={(open) => !open && setDeletingUpdateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              update.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
