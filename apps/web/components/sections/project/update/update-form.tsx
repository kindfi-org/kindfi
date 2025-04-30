"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/base/button";
import { Card, CardContent } from "~/components/base/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/base/form";
import { Checkbox } from "~/components/base/checkbox";
import { Input } from "~/components/base/input";
import { Textarea } from "~/components/base/textarea";

// Define the form schema with Zod based on actual DB structure
const updateFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  is_featured: z.boolean().optional().default(false),
});

// Infer the type from the schema
type UpdateFormValues = z.infer<typeof updateFormSchema>;

// Define the update type based on actual DB structure
interface UpdateData {
  id?: string;
  title: string;
  content: string;
  is_featured?: boolean;
}

interface UpdateFormProps {
  update?: UpdateData;
  onSubmit: (data: UpdateData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function UpdateForm({
  update,
  onSubmit,
  onCancel,
  isSubmitting,
}: UpdateFormProps) {
  // Initialize the form with react-hook-form and zod resolver
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      title: update?.title || "",
      content: update?.content || "",
      is_featured: update?.is_featured || false,
    },
  });

  // Handle form submission
  const handleSubmit = (values: UpdateFormValues) => {
    // If we're editing, preserve the ID
    if (update?.id) {
      onSubmit({ ...values, id: update.id });
    } else {
      onSubmit(values);
    }
  };

  return (
    <Card className="mb-6 border-blue-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">
          {update?.id ? "Edit Update" : "Create New Update"}
        </h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="update-title"
                    className="block text-sm font-medium mb-1"
                  >
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="update-title"
                      placeholder="Enter update title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="update-content"
                    className="block text-sm font-medium mb-1"
                  >
                    Content
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="update-content"
                      placeholder="Enter update details"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Feature this update</FormLabel>
                    <p className="text-sm text-gray-500">
                      Featured updates will be highlighted on the project page
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : update?.id ? (
                  "Save Changes"
                ) : (
                  "Post Update"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
