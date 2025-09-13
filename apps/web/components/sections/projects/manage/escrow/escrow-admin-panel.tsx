"use client";

import type {
  EscrowType,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
} from "@trustless-work/escrow";
import { Plus, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/base/button";
import { Input } from "~/components/base/input";
import { RadioGroup, RadioGroupItem } from "~/components/base/radio-group";
import { Textarea } from "~/components/base/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/base/tooltip";
import { useEscrow } from "~/hooks/contexts/use-escrow.context";
import { useWallet } from "~/hooks/contexts/use-stellar-wallet.context";
import { logger } from "~/lib";

export function EscrowAdminPanel({
  projectId,
  escrowContractAddress,
  escrowType,
}: {
  projectId: string;
  escrowContractAddress?: string;
  escrowType?: EscrowType;
}) {
  const { deployEscrow, approveMilestone, changeMilestoneStatus } = useEscrow();
  const { isConnected, connect, address } = useWallet();

  // form state
  const [selectedEscrowType, setSelectedEscrowType] = useState<EscrowType>(
    escrowType || "single-release",
  );
  const [title, setTitle] = useState("");
  const [engagementId, setEngagementId] = useState<string>("");
  const [trustlineAddress, setTrustlineAddress] = useState<string>("");
  const [trustlineDecimals, setTrustlineDecimals] = useState<number | "">(7);
  const [approver, setApprover] = useState<string>("");
  const [serviceProvider, setServiceProvider] = useState<string>("");
  const [releaseSigner, setReleaseSigner] = useState<string>("");
  const [disputeResolver, setDisputeResolver] = useState<string>("");
  const [platformAddress, setPlatformAddress] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");
  const [platformFee, setPlatformFee] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [receiverMemo, setReceiverMemo] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  type MilestoneItem = { id: string; description: string };
  const genId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: genId(), description: "Milestone 1" },
  ]);

  // admin actions state
  const [milestoneIndex, _setMilestoneIndex] = useState("0");
  const titleId = useId();
  const amountId = useId();
  const _milestoneId = useId();
  const engagementIdInputId = useId();
  const escrowTypeLabelId = useId();
  const trustlineAddressId = useId();
  const trustlineDecimalsId = useId();
  const approverId = useId();
  const spId = useId();
  const releaseSignerId = useId();
  const disputeResolverId = useId();
  const platformAddressId = useId();
  const receiverId = useId();
  const platformFeeId = useId();
  const receiverMemoId = useId();
  const descriptionId = useId();
  const singleReleaseRadioId = useId();
  const multiReleaseRadioId = useId();

  const ensureWallet = async () => {
    if (!isConnected) await connect();
    if (!address) throw new Error("Wallet address missing");
    return address;
  };

  const areRequiredFieldsValid = useMemo(() => {
    return (
      title.trim().length > 0 &&
      (engagementId || `project-${projectId}`).trim().length > 0 &&
      trustlineAddress.trim().length > 0 &&
      typeof trustlineDecimals === "number" &&
      Number.isFinite(trustlineDecimals) &&
      approver.trim().length > 0 &&
      serviceProvider.trim().length > 0 &&
      releaseSigner.trim().length > 0 &&
      disputeResolver.trim().length > 0 &&
      platformAddress.trim().length > 0 &&
      receiver.trim().length > 0 &&
      typeof platformFee === "number" &&
      Number.isFinite(platformFee) &&
      typeof amount === "number" &&
      Number.isFinite(amount) &&
      description.trim().length > 0 &&
      milestones.filter((m) => m.description.trim().length > 0).length > 0
    );
  }, [
    title,
    engagementId,
    projectId,
    trustlineAddress,
    trustlineDecimals,
    approver,
    serviceProvider,
    releaseSigner,
    disputeResolver,
    platformAddress,
    receiver,
    platformFee,
    amount,
    description,
    milestones,
  ]);

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { id: genId(), description: `Milestone ${prev.length + 1}` },
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCreateEscrow = async () => {
    try {
      const signer = await ensureWallet();
      if (!areRequiredFieldsValid) {
        toast.error("Please complete all required fields");
        return;
      }
      const effectiveEngagementId = (
        engagementId || `project-${projectId}`
      ).trim();
      const sanitizedMilestones = milestones
        .map((m) => m.description)
        .filter((desc) => desc.trim().length > 0)
        .map((desc) => ({ description: desc.trim() }));
      const composedDescription =
        receiverMemo.trim().length > 0
          ? `${description.trim()}\nReceiver Memo: ${receiverMemo.trim()}`
          : description.trim();
      const payload:
        | InitializeSingleReleaseEscrowPayload
        | InitializeMultiReleaseEscrowPayload = {
        signer,
        engagementId: effectiveEngagementId,
        title: title.trim(),
        roles: {
          approver: approver.trim(),
          serviceProvider: serviceProvider.trim(),
          platformAddress: platformAddress.trim(),
          releaseSigner: releaseSigner.trim(),
          disputeResolver: disputeResolver.trim(),
          receiver: receiver.trim(),
        },
        description: composedDescription,
        amount: amount as number,
        platformFee: platformFee as number,
        trustline: {
          address: trustlineAddress.trim(),
          decimals: trustlineDecimals as number,
        },
        milestones: sanitizedMilestones,
      };
      const res = await deployEscrow(
        payload,
        (selectedEscrowType as EscrowType) || "single-release",
      );
      if (res.status !== "SUCCESS") throw new Error("Failed to create escrow");
      toast.success(
        "Escrow initialized. Sign and broadcast next steps in flow.",
      );
    } catch (e) {
      logger.error({
        eventType: "Error Initializing escrow",
        error: e instanceof Error ? e.message : "Unknown error",
        details: e,
      });
      toast.error("Failed to create escrow");
    }
  };

  const _handleApproveMilestone = async () => {
    if (!escrowContractAddress)
      return toast.error("No escrow contract configured");
    try {
      const signer = await ensureWallet();
      const res = await approveMilestone(
        {
          contractId: escrowContractAddress,
          milestoneIndex,
          approver: signer,
          newFlag: true,
        },
        (escrowType as EscrowType) || "single-release",
      );
      if (res.status !== "SUCCESS") throw new Error("Approve failed");
      toast.success(
        "Milestone approved (unsigned tx). Continue to sign & submit.",
      );
    } catch (e) {
      logger.error({
        eventType: "Error approving milestone",
        error: e instanceof Error ? e.message : "Unknown error",
        details: e,
      });
      toast.error("Failed to approve milestone");
    }
  };

  const _handleChangeMilestoneStatus = async () => {
    if (!escrowContractAddress)
      return toast.error("No escrow contract configured");
    try {
      const signer = await ensureWallet();
      const res = await changeMilestoneStatus(
        {
          contractId: escrowContractAddress,
          milestoneIndex,
          newStatus: "approved",
          newEvidence: "Updated via admin panel",
          serviceProvider: signer,
        },
        (escrowType as EscrowType) || "multi-release",
      );
      if (res.status !== "SUCCESS") throw new Error("Update failed");
      toast.success(
        "Milestone status updated (unsigned tx). Continue to sign & submit.",
      );
    } catch (e) {
      logger.error({
        eventType: "Error updating milestone status",
        error: e instanceof Error ? e.message : "Unknown error",
        details: e,
      });
      toast.error("Failed to update milestone status");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Escrow Admin</h1>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <h2 className="text-lg font-semibold">
                Fill in the details of the Escrow
              </h2>
              <Tooltip>
                <TooltipTrigger className="text-xs underline">
                  More information
                </TooltipTrigger>
                <TooltipContent>
                  Provide all required fields to initialize the escrow.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to set up a secure and reliable escrow
              agreement.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <p className="text-sm font-medium" id={escrowTypeLabelId}>
                Change Escrow Type
              </p>
              <RadioGroup
                aria-labelledby={escrowTypeLabelId}
                value={selectedEscrowType}
                onValueChange={(val) =>
                  setSelectedEscrowType(val as EscrowType)
                }
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <div className="flex gap-2 items-center p-3 rounded-md border">
                  <RadioGroupItem
                    id={singleReleaseRadioId}
                    value="single-release"
                  />
                  <label
                    htmlFor={singleReleaseRadioId}
                    className="text-sm font-medium"
                  >
                    Single Release Escrow
                  </label>
                </div>
                <div className="flex gap-2 items-center p-3 rounded-md border">
                  <RadioGroupItem
                    id={multiReleaseRadioId}
                    value="multi-release"
                  />
                  <label
                    htmlFor={multiReleaseRadioId}
                    className="text-sm font-medium"
                  >
                    Multi Release Escrow
                  </label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                A {selectedEscrowType === "single-release" ? "single" : "multi"}{" "}
                payment will be released upon completion of milestones.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor={titleId} className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id={titleId}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Escrow title"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor={engagementIdInputId}
                  className="text-sm font-medium"
                >
                  Engagement <span className="text-destructive">*</span>
                </label>
                <Input
                  id={engagementIdInputId}
                  value={engagementId}
                  onChange={(e) => setEngagementId(e.target.value)}
                  placeholder={`project-${projectId}`}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex gap-2 items-center">
                  <label
                    htmlFor={trustlineAddressId}
                    className="text-sm font-medium"
                  >
                    Trustline <span className="text-destructive">*</span>
                  </label>
                  <Tooltip>
                    <TooltipTrigger className="text-xs underline">
                      More information
                    </TooltipTrigger>
                    <TooltipContent>
                      Provide the asset contract address and decimals.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Input
                    id={trustlineAddressId}
                    value={trustlineAddress}
                    onChange={(e) => setTrustlineAddress(e.target.value)}
                    placeholder="Asset contract address"
                  />
                  <Input
                    id={trustlineDecimalsId}
                    type="number"
                    value={trustlineDecimals}
                    onChange={(e) =>
                      setTrustlineDecimals(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Decimals"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor={approverId} className="text-sm font-medium">
                  Approver <span className="text-destructive">*</span>
                </label>
                <Input
                  id={approverId}
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  placeholder="Enter approver address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={spId} className="text-sm font-medium">
                  Service Provider <span className="text-destructive">*</span>
                </label>
                <Input
                  id={spId}
                  value={serviceProvider}
                  onChange={(e) => setServiceProvider(e.target.value)}
                  placeholder="Enter service provider address"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor={releaseSignerId}
                  className="text-sm font-medium"
                >
                  Release Signer <span className="text-destructive">*</span>
                </label>
                <Input
                  id={releaseSignerId}
                  value={releaseSigner}
                  onChange={(e) => setReleaseSigner(e.target.value)}
                  placeholder="Enter release signer address"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor={disputeResolverId}
                  className="text-sm font-medium"
                >
                  Dispute Resolver <span className="text-destructive">*</span>
                </label>
                <Input
                  id={disputeResolverId}
                  value={disputeResolver}
                  onChange={(e) => setDisputeResolver(e.target.value)}
                  placeholder="Enter dispute resolver address"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor={platformAddressId}
                  className="text-sm font-medium"
                >
                  Platform Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id={platformAddressId}
                  value={platformAddress}
                  onChange={(e) => setPlatformAddress(e.target.value)}
                  placeholder="Enter platform address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={receiverId} className="text-sm font-medium">
                  Receiver <span className="text-destructive">*</span>
                </label>
                <Input
                  id={receiverId}
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder="Enter receiver address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={platformFeeId} className="text-sm font-medium">
                  Platform Fee <span className="text-destructive">*</span>
                </label>
                <Input
                  id={platformFeeId}
                  type="number"
                  value={platformFee}
                  onChange={(e) =>
                    setPlatformFee(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Enter platform fee"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={amountId} className="text-sm font-medium">
                  Amount <span className="text-destructive">*</span>
                </label>
                <Input
                  id={amountId}
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={receiverMemoId} className="text-sm font-medium">
                  Receiver Memo (optional)
                </label>
                <Input
                  id={receiverMemoId}
                  value={receiverMemo}
                  onChange={(e) => setReceiverMemo(e.target.value)}
                  placeholder="Enter the escrow receiver Memo"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <label htmlFor={descriptionId} className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id={descriptionId}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escrow description"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <h3 className="text-sm font-medium">
                    Milestones <span className="text-destructive">*</span>
                  </h3>
                  <Tooltip>
                    <TooltipTrigger className="text-xs underline">
                      More information
                    </TooltipTrigger>
                    <TooltipContent>
                      Provide one or more milestone descriptions.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  onClick={handleAddMilestone}
                  variant="outline"
                  className="px-2 h-8"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={m.id} className="flex gap-2 items-center">
                    <Input
                      value={m.description}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((val, idx) =>
                            idx === i
                              ? { ...val, description: e.target.value }
                              : val,
                          ),
                        )
                      }
                      placeholder="Milestone Description"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="p-0 w-8 h-8"
                      aria-label={`Remove milestone ${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateEscrow}
                disabled={!areRequiredFieldsValid}
                className="px-6 py-2 font-semibold text-white bg-gradient-to-r rounded-lg shadow-md transition-colors duration-200 from-primary to-secondary hover:from-secondary hover:to-primary disabled:opacity-60 disabled:cursor-not-allowed"
                size="lg"
              >
                <Plus className="mr-2 w-4 h-4" />
                Initialize Escrow
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>

      <div className="h-px bg-gray-200" />
    </div>
  );
}
