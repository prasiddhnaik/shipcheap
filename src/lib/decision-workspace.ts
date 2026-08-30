import { platforms } from "@/data/platforms";
import {
  simulateMonthlyBill,
  type BillSimulationResult,
  type SimulatorInput,
} from "@/lib/billing-risk-simulation";
import { buildLaunchChecklist, type LaunchCheckItem } from "@/lib/launch-checklist";
import { defaultCalculatorInput, recommendPlatforms } from "@/lib/recommend-platform";
import type { CalculatorInput, RankedPlatform } from "@/lib/types";

export type WorkspaceStage = "requirements" | "shortlist" | "billing" | "launch";
export type WorkspaceActor = "user" | "agent" | "system";
export type SourceConfidenceLevel = "verified" | "needs-review" | "unknown";

export type WorkspaceActivity = {
  id: string;
  actor: WorkspaceActor;
  toolName?: string;
  summary: string;
  createdAt: string;
};

export type WorkspaceBillingComparison = {
  providerSlug: string;
} & BillSimulationResult;

export type DecisionWorkspaceState = {
  version: 1;
  requirements: CalculatorInput;
  requirementsConfirmed: boolean;
  stage: WorkspaceStage;
  shortlist: string[];
  billingComparisons: Record<string, WorkspaceBillingComparison>;
  selectedProviderSlug: string | null;
  proposedProviderSlug: string | null;
  proposalRationale: string | null;
  launchCheckProgress: Record<string, boolean>;
  acceptedUncertainty: Record<string, boolean>;
  sourceConfidenceBySlug: Record<string, SourceConfidenceLevel>;
  humanApproved: boolean;
  activity: WorkspaceActivity[];
};

export type DecisionWorkspaceAction = {
  type: "requirements.set";
  requirements: CalculatorInput;
  actor: WorkspaceActor;
  toolName?: string;
};

export function createDecisionWorkspace(): DecisionWorkspaceState {
  return {
    version: 1,
    requirements: { ...defaultCalculatorInput },
    requirementsConfirmed: false,
    stage: "requirements",
    shortlist: [],
    billingComparisons: {},
    selectedProviderSlug: null,
    proposedProviderSlug: null,
    proposalRationale: null,
    launchCheckProgress: {},
    acceptedUncertainty: {},
    sourceConfidenceBySlug: {},
    humanApproved: false,
    activity: [],
  };
}

export function reduceDecisionWorkspace(
  state: DecisionWorkspaceState,
  action: DecisionWorkspaceAction,
): DecisionWorkspaceState {
  if (action.type === "requirements.set") {
    return appendActivity(
      {
        ...state,
        requirements: { ...action.requirements },
        requirementsConfirmed: false,
        stage: "requirements",
        shortlist: [],
        billingComparisons: {},
        selectedProviderSlug: null,
        proposedProviderSlug: null,
        proposalRationale: null,
        launchCheckProgress: {},
        acceptedUncertainty: {},
        sourceConfidenceBySlug: {},
        humanApproved: false,
      },
      {
        actor: action.actor,
        toolName: action.toolName,
        summary: "Updated hosting requirements and cleared results that no longer match.",
      },
    );
  }

  return state;
}

export function buildWorkspaceShortlist(
  state: DecisionWorkspaceState,
  confidenceBySlug: Record<string, SourceConfidenceLevel>,
): DecisionWorkspaceState {
  const shortlist = recommendPlatforms(state.requirements)
    .filter((result) => !violatesHardConstraint(result, state.requirements))
    .slice(0, 3)
    .map((result) => result.platform.slug);

  return appendActivity(
    {
      ...state,
      requirementsConfirmed: true,
      stage: "shortlist",
      shortlist,
      sourceConfidenceBySlug: Object.fromEntries(
        shortlist.map((slug) => [slug, confidenceBySlug[slug] ?? "unknown"]),
      ),
      billingComparisons: {},
      selectedProviderSlug: null,
      proposedProviderSlug: null,
      proposalRationale: null,
      launchCheckProgress: {},
      acceptedUncertainty: {},
      humanApproved: false,
    },
    {
      actor: "system",
      summary: `Built a ${shortlist.length}-provider shortlist after applying hard constraints.`,
    },
  );
}

export function compareWorkspaceBilling(
  state: DecisionWorkspaceState,
  input: SimulatorInput,
  providerSlugs: string[],
  actor: WorkspaceActor = "system",
  toolName?: string,
): DecisionWorkspaceState {
  const uniqueSlugs = [...new Set(providerSlugs)].slice(0, 3);
  const comparisons = Object.fromEntries(
    uniqueSlugs.map((slug) => {
      const platform = platforms.find((entry) => entry.slug === slug);
      if (!platform) throw new Error(`Unknown provider: ${slug}.`);
      return [
        slug,
        {
          providerSlug: slug,
          ...simulateMonthlyBill({ ...input, providerSlug: slug }, platform),
        },
      ];
    }),
  );

  return appendActivity(
    { ...state, stage: "billing", billingComparisons: comparisons },
    {
      actor,
      toolName,
      summary: `Stress-tested ${uniqueSlugs.length} provider${uniqueSlugs.length === 1 ? "" : "s"} with the same billing scenario.`,
    },
  );
}

export function proposeWorkspaceDecision(
  state: DecisionWorkspaceState,
  providerSlug: string,
  rationale: string,
  actor: WorkspaceActor,
  toolName?: string,
): DecisionWorkspaceState {
  if (!state.shortlist.includes(providerSlug)) {
    throw new Error("The proposed provider must be in the current shortlist.");
  }
  if (
    state.sourceConfidenceBySlug[providerSlug] !== "verified" &&
    !state.acceptedUncertainty[providerSlug]
  ) {
    throw new Error("The user must accept source uncertainty before this provider can be proposed.");
  }
  const trimmedRationale = rationale.trim();
  if (trimmedRationale.length < 8 || trimmedRationale.length > 600) {
    throw new Error("Decision rationale must be between 8 and 600 characters.");
  }

  return appendActivity(
    {
      ...state,
      stage: "launch",
      selectedProviderSlug: providerSlug,
      proposedProviderSlug: providerSlug,
      proposalRationale: trimmedRationale,
      launchCheckProgress: {},
      humanApproved: false,
    },
    {
      actor,
      toolName,
      summary: `Proposed ${providerName(providerSlug)} for human review.`,
    },
  );
}

export function createWorkspaceLaunchPlan(state: DecisionWorkspaceState): LaunchCheckItem[] {
  const slug = state.selectedProviderSlug ?? state.proposedProviderSlug;
  if (!slug) return [];
  const platform = platforms.find((entry) => entry.slug === slug);
  if (!platform) throw new Error(`Unknown provider: ${slug}.`);
  return buildLaunchChecklist(platform);
}

export function updateWorkspaceLaunchCheck(
  state: DecisionWorkspaceState,
  itemId: string,
  completed: boolean,
  actor: WorkspaceActor,
  toolName?: string,
): DecisionWorkspaceState {
  const item = createWorkspaceLaunchPlan(state).find((entry) => entry.id === itemId);
  if (!item) throw new Error(`Unknown launch check: ${itemId}.`);

  return appendActivity(
    {
      ...state,
      stage: "launch",
      launchCheckProgress: { ...state.launchCheckProgress, [itemId]: completed },
    },
    {
      actor,
      toolName,
      summary: `${completed ? "Completed" : "Reopened"} launch check: ${item.title}.`,
    },
  );
}

export function resetDecisionWorkspace(): DecisionWorkspaceState {
  return createDecisionWorkspace();
}

function violatesHardConstraint(result: RankedPlatform, input: CalculatorInput) {
  return (
    (!input.hasCard && result.platform.creditCardRequired) ||
    (input.alwaysOn && !result.platform.alwaysOn) ||
    !result.platform.supports.includes(input.appType) ||
    (input.database !== "none" && !result.platform.databases.includes(input.database))
  );
}

function providerName(slug: string) {
  return platforms.find((entry) => entry.slug === slug)?.name ?? slug;
}

function appendActivity(
  state: DecisionWorkspaceState,
  event: Omit<WorkspaceActivity, "id" | "createdAt">,
): DecisionWorkspaceState {
  const createdAt = new Date().toISOString();
  const nextEvent: WorkspaceActivity = {
    ...event,
    id: `${createdAt}:${state.activity.length}`,
    createdAt,
  };
  return { ...state, activity: [...state.activity, nextEvent].slice(-50) };
}
