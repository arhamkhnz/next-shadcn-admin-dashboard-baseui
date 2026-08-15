import type { ResourceAction } from "./resource-types";

export const SUPPORT_CASE_ACTIONS: ResourceAction[] = [
  {
    id: "acknowledge",
    label: "Acknowledge case",
    description: "Claim the open support case into active triage so SLA ownership is visible.",
    endpoint: "operations/support/cases/{id}/status",
    method: "PUT",
    body: { status: "IN_PROGRESS" },
    submitLabel: "Acknowledge case",
    when: { key: "status", in: ["OPEN"] },
    successMessage: "Support case acknowledged",
  },
  {
    id: "reply",
    label: "Reply to case",
    description: "Send an audited operations reply for the selected support case.",
    endpoint: "operations/support/cases/{id}/messages",
    fields: [{ name: "body", label: "Reply", placeholder: "Write a clear response for the driver" }],
    submitLabel: "Send reply",
    successMessage: "Reply sent",
  },
  {
    id: "status",
    label: "Update status",
    description: "Move the selected support case through its resolution workflow.",
    endpoint: "operations/support/cases/{id}/status",
    method: "PUT",
    fields: [
      {
        name: "status",
        label: "Status",
        options: ["OPEN", "IN_PROGRESS", "WAITING_ON_RIDER", "RESOLVED", "CLOSED"],
      },
    ],
    submitLabel: "Update status",
  },
];

export const SAFETY_INCIDENT_ACTIONS: ResourceAction[] = [
  {
    id: "acknowledge",
    label: "Acknowledge SOS",
    description: "Confirm that operations has seen and is handling this incident.",
    endpoint: "operations/safety/incidents/{id}/acknowledge",
    submitLabel: "Acknowledge",
    when: { key: "status", in: ["OPEN"] },
    successMessage: "SOS acknowledged",
  },
  {
    id: "resolve",
    label: "Resolve incident",
    description: "Confirm that this safety incident has been handled and can be closed.",
    endpoint: "operations/safety/incidents/{id}/resolve",
    submitLabel: "Resolve incident",
    variant: "destructive",
    when: { key: "status", in: ["OPEN", "ACKNOWLEDGED"] },
  },
];

export const FRAUD_SIGNAL_ACTIONS: ResourceAction[] = [
  {
    id: "review",
    label: "Review signal",
    description: "Record the investigation outcome for the selected fraud signal.",
    endpoint: "operations/platform/fraud-signals/{id}/status",
    method: "PUT",
    fields: [
      {
        name: "status",
        label: "Outcome",
        options: ["UNDER_REVIEW", "RESOLVED", "DISMISSED", "RESTRICTION_APPLIED"],
      },
      { name: "reasonCode", label: "Reason", placeholder: "Reference the evidence or support case" },
    ],
    submitLabel: "Save outcome",
  },
];

export const FINANCE_DISPUTE_ACTIONS: ResourceAction[] = [
  {
    id: "resolve",
    label: "Review dispute",
    description: "Record the reviewed status, reason, and note for this payout dispute.",
    endpoint: "operations/platform/finance/disputes/{id}/status",
    method: "PUT",
    fields: [
      { name: "status", label: "Status", options: ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"] },
      { name: "reasonCode", label: "Reason", placeholder: "Reference the investigation or support case" },
      { name: "note", label: "Review note", placeholder: "Summarise the decision" },
    ],
    submitLabel: "Save review",
  },
];

export const APPROVAL_ACTIONS: ResourceAction[] = [
  {
    id: "approve",
    label: "Approve request",
    description: "Apply this pending high-risk change after an independent review.",
    endpoint: "operations/platform/approvals/{id}/approve",
    fields: [{ name: "reasonCode", label: "Decision reason", placeholder: "Explain the independent review" }],
    submitLabel: "Approve request",
    when: { key: "status", in: ["PENDING"] },
  },
];

export const DRIVER_ACTIONS: ResourceAction[] = [
  {
    id: "change-state",
    label: "Change driver state",
    description: "Update access for the selected driver. Deactivation enters the approval queue.",
    endpoint: "operations/platform/riders/{id}/state",
    variant: "destructive",
    fields: [
      { name: "state", label: "New state", options: ["ACTIVE_OFFLINE", "SUSPENDED", "DEACTIVATED"] },
      { name: "reasonCode", label: "Reason", placeholder: "Reference the support or compliance case" },
      { name: "note", label: "Internal note", placeholder: "Explain why this state change is required" },
    ],
    submitLabel: "Apply state change",
  },
];
