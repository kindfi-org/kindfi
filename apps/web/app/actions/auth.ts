"use server";

import { db } from "@packages/drizzle";
import { devices } from "@packages/drizzle/src/data/schema";
import { appEnvConfig } from "@packages/lib/config";
import { supabase as supabaseServiceRole } from "@packages/lib/supabase";
import { createSupabaseServerClient } from "@packages/lib/supabase-server";
import type { AppEnvInterface } from "@packages/lib/types";
import type { Database } from "@services/supabase";
import type { AuthError } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import { validateCsrfToken } from "~/app/actions/csrf";
import { AuthErrorHandler } from "~/lib/auth/error-handler";
import { Logger } from "~/lib/logger";
import type { AuthResponse } from "~/lib/types/auth";

type Tables = Database["public"]["Tables"];
type EscrowRecord = Tables["escrow_status"]["Row"];
type EscrowStatusType =
  | "NEW"
  | "FUNDED"
  | "ACTIVE"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

type EscrowResponse = {
  success: boolean;
  message: string;
  data?: EscrowRecord | EscrowRecord[] | null;
  error?: string | null;
};

const logger = new Logger();
const errorHandler = new AuthErrorHandler(logger);

export async function signUpAction(formData: FormData): Promise<AuthResponse> {
  const appConfig: AppEnvInterface = appEnvConfig("web");
  if (!validateCsrfToken(formData.get("csrfToken")?.toString())) {
    return {
      success: false,
      message: "Invalid CSRF token",
      error: "Invalid CSRF token",
    };
  }
  const supabase = supabaseServiceRole;
  const email = formData.get("email") as string;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .single();

  if (existingUser) {
    console.warn(
      "🔧 KindfiSupabaseAdapter: User already exists",
      existingUser.id,
    );
    throw new Error("This account is already registered. Sign in instead!");
  }

  const signInWithOptOpt = {
    email,
    options: {
      emailRedirectTo: `${appConfig.deployment.appUrl}/auth/callback?redirect_to=/otp-validation?email=${email}`,
    },
  };

  try {
    const { data, error } = await supabase.auth.signInWithOtp(signInWithOptOpt);
    if (error) {
      logger.error({
        eventType: "Error signing up with otp",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      });
      return errorHandler.handleAuthError(error, "sign_up");
    }

    revalidatePath("/sign-up", "layout");
    console.log("Sign up data: ", data);
    return {
      success: true,
      message:
        "Verification code sent! Please check your email to confirm your account.",
      redirect: `/otp-validation?email=${encodeURIComponent(signInWithOptOpt.email)}`,
      data,
    };
  } catch (error) {
    logger.error({
      eventType: "Error signing up in general",
      error: error instanceof Error ? error.message : "Unknown error",
      details: error,
    });
    return errorHandler.handleAuthError(error as AuthError, "sign_up");
  }
}

export async function createSessionAction({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): Promise<AuthResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    // Verify the user exists and the email matches
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .eq("email", email)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message:
          "User verification failed. Email does not match registered user.",
        error: "User verification failed",
      };
    }

    logger.info({
      eventType: "SESSION_CREATED",
      userId,
      email,
    });

    if (userError) {
      errorHandler.handleAuthError(userError, "sign_in");
    }

    return {
      success: true,
      message: "Session created successfully",
      redirect: "/dashboard",
      // data: sessionData,
      data: userData,
    } as AuthResponse;
  } catch (error) {
    logger.error({
      eventType: "SESSION_CREATION_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      email,
    });
    return errorHandler.handleAuthError(error as AuthError, "create_session");
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();

  try {
    // Clear NextAuth session
    await signOut({ redirect: false });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const response = errorHandler.handleAuthError(error, "sign_out");
        redirect(`/?error=${encodeURIComponent(response.message)}`);
      }
    } catch (error) {
      logger.error({
        eventType: "No supabase session",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      });
    }

    redirect("/sign-in?success=Successfully signed out");
  } catch (error) {
    const response = errorHandler.handleAuthError(
      error as AuthError,
      "sign_out",
    );
    redirect(`/?error=${encodeURIComponent(response.message)}`);
  }
}

export async function requestResetAccountAction(
  formData: FormData,
): Promise<void> {
  if (!validateCsrfToken(formData.get("csrfToken")?.toString())) {
    redirect("/reset-account?error=Invalid CSRF token");
  }
  const email = formData.get("email")?.toString();
  const _supabase = await createSupabaseServerClient();
  const _origin = (await headers()).get("origin");

  if (!email) {
    redirect("/reset-account?error=Email is required");
  }

  try {
    // TODO: Implement a proper reset account flow
    // This is a placeholder for the actual reset account logic
    // const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // 	redirectTo: `${origin}/auth/callback?redirect_to=//reset-account`,
    // })

    // if (error) {
    // 	const response = errorHandler.handleAuthError(error, 'forgot_password')
    // 	redirect(`/reset-account?error=${encodeURIComponent(response.message)}`)
    // }

    redirect(
      "/reset-account?success=Check your email for a confirmation request to reset your account",
    );
  } catch (error) {
    const response = errorHandler.handleAuthError(
      error as AuthError,
      "reset_account",
    );
    redirect(`/reset-account?error=${encodeURIComponent(response.message)}`);
  }
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
  if (!validateCsrfToken(formData.get("csrfToken")?.toString())) {
    redirect("/reset-password?error=Invalid CSRF token");
  }
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    redirect(
      "/reset-password?error=Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=Passwords do not match");
  }

  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      const response = errorHandler.handleAuthError(error, "reset_password");
      redirect(`/reset-password?error=${encodeURIComponent(response.message)}`);
    }

    redirect("/sign-in?success=Password updated successfully");
  } catch (error) {
    const response = errorHandler.handleAuthError(
      error as AuthError,
      "reset_password",
    );
    redirect(`/reset-password?error=${encodeURIComponent(response.message)}`);
  }
}

// Helper function to check auth status
export async function checkAuthStatus(): Promise<AuthResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return errorHandler.handleAuthError(error, "check_auth");
    }

    if (!session) {
      return {
        success: false,
        message: "No active session",
        redirect: "/sign-in",
      };
    }

    return {
      success: true,
      message: "Active session found",
    };
  } catch (error) {
    return errorHandler.handleAuthError(error as AuthError, "check_auth");
  }
}

export async function updateEscrowStatusAction(
  id: string,
  newStatus: EscrowStatusType,
): Promise<EscrowResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("escrow_status")
      .update({
        status: newStatus,
        last_updated: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/escrow");
    return {
      success: true,
      message: `Status updated to ${newStatus}`,
      data,
    };
  } catch (error) {
    logger.error({
      eventType: "ESCROW_STATUS_UPDATE_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
      id,
      newStatus,
    });
    return {
      success: false,
      message: "Failed to update escrow status",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateEscrowMilestoneAction(
  id: string,
  current: number,
  completed: number,
): Promise<EscrowResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("escrow_status")
      .update({
        current_milestone: current,
        metadata: {
          milestoneStatus: {
            current,
            completed,
          },
        },
        last_updated: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/escrow");
    return {
      success: true,
      message: "Milestone updated successfully",
      data,
    };
  } catch (error) {
    logger.error({
      eventType: "ESCROW_MILESTONE_UPDATE_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
      id,
      current,
      completed,
    });
    return {
      success: false,
      message: "Failed to update milestone",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateEscrowFinancialsAction(
  id: string,
  funded: number,
  released: number,
): Promise<EscrowResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("escrow_status")
      .update({
        total_funded: funded,
        total_released: released,
        last_updated: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/escrow");
    return {
      success: true,
      message: "Financials updated successfully",
      data,
    };
  } catch (error) {
    logger.error({
      eventType: "ESCROW_FINANCIALS_UPDATE_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
      id,
      funded,
      released,
    });
    return {
      success: false,
      message: "Failed to update financials",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getEscrowRecordsAction(): Promise<EscrowResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("escrow_status")
      .select("*")
      .order("last_updated", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      message: "Records fetched successfully",
      data,
    };
  } catch (error) {
    logger.error({
      eventType: "ESCROW_RECORDS_FETCH_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      success: false,
      message: "Failed to fetch records",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function insertTestEscrowRecordAction(): Promise<EscrowResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("escrow_status")
      .insert([
        {
          escrow_id: `test-${Date.now()}`,
          status: "NEW" as EscrowStatusType,
          current_milestone: 1,
          total_funded: 1000,
          total_released: 0,
          metadata: {
            milestoneStatus: {
              total: 3,
              completed: 0,
            },
          },
        },
      ])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/escrow");
    return {
      success: true,
      message: "Test record inserted successfully",
      data,
    };
  } catch (error) {
    logger.error({
      eventType: "ESCROW_TEST_RECORD_INSERT_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      success: false,
      message: "Failed to insert test record",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateDeviceWithDeployee(deployeeUpdateData: string) {
  const {
    deployeeAddress,
    aaguid,
    userId,
    credentialId,
  }: {
    deployeeAddress: string;
    credentialId: string;
    userId: string;
    aaguid?: string;
  } = JSON.parse(deployeeUpdateData);
  // Get current user from session or context
  console.log("updateDeviceWithDeployee::>", {
    deployeeAddress,
    aaguid,
    userId,
    credentialId,
  });
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Validate input parameters
    if (!userId || !credentialId || !deployeeAddress || !aaguid) {
      return {
        success: false,
        message: "Missing required parameters",
        error: "Invalid input parameters",
      };
    }

    // Verify the device exists and belongs to the user
    const existingDevice = await db
      .select({
        id: devices.id,
        userId: devices.userId,
        aaguid: devices.aaguid,
        credentialId: devices.credentialId,
      })
      .from(devices)
      .where(
        and(eq(devices.userId, userId), eq(devices.credentialId, credentialId)),
      )
      .limit(1);

    if (!existingDevice.length) {
      return {
        success: false,
        message: "Device not found or does not belong to user",
        error: "Device verification failed",
      };
    }

    const deviceToUpdate = existingDevice[0];

    // Update the device with deployee address and AAGUID
    const updatedDevice = await db
      .update(devices)
      .set({
        address: deployeeAddress,
        aaguid: aaguid || deviceToUpdate.aaguid,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(devices.id, deviceToUpdate.id))
      .returning();

    if (!updatedDevice.length) {
      logger.error({
        eventType: "DEVICE_UPDATE_ERROR",
        error: "No device was updated",
        userId,
        credentialId,
      });
      return {
        success: false,
        message: "Failed to update device information",
        error: "No device was updated",
      };
    }

    logger.info({
      eventType: "DEVICE_UPDATED",
      userId,
      credentialId,
      deployeeAddress,
      aaguid,
    });

    return {
      success: true,
      message: "Device updated successfully",
      data: updatedDevice[0],
    };
  } catch (error) {
    logger.error({
      eventType: "DEVICE_UPDATE_EXCEPTION",
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      credentialId,
    });

    return {
      success: false,
      message: "An error occurred while updating the device",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
