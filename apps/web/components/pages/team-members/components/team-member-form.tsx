import type { UseFormReturn } from "react-hook-form";
import { Form } from "~/components/base/form";
import type { formInputs } from "../team-members";
import { TeamMemberList } from "./team-member-list";
import { VisibilityToggle } from "./visibility-toggle";
import { CSRFTokenField } from "~/components/base/form";

interface TeamMemberFormProps {
  form: UseFormReturn<formInputs>;
  roles: { value: string; label: string }[];
  onSubmit: (values: formInputs) => void;
  isSubmitting: boolean;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  form,
  roles,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CSRFTokenField />
        <TeamMemberList form={form} roles={roles} />
        <VisibilityToggle form={form} roles={roles} />

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="min-w-[200px] px-4 py-2 border border-green-500 text-green-500 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-green-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  aria-label="Loading icon"
                  className="w-4 h-4 mr-2 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <title id="loading-icon">Loading...</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </Form>
  );
};

export { TeamMemberForm };
