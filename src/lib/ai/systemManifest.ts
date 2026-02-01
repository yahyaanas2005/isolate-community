export const SYSTEM_MANIFEST = [
    {
        title: "Platform Overview",
        content: "Isolate Community is a unified operating system for residential communities (Gated Societies, HOAs). It consolidates Membership, Security, Finance, and Facility Management into one dashboard.",
        category: "general"
    },
    {
        title: "Dashboard Navigation",
        content: "Main URL: /dashboard/[slug]\n- Members: /dashboard/[slug]/members (Directory, Approvals)\n- Notices: /dashboard/[slug]/notices (Announcements, Events)\n- Help Desk: /dashboard/[slug]/helpdesk (Complaints, Maintenance)\n- Finance: /dashboard/[slug]/finance (duties, invoices)\n- Security: /dashboard/[slug]/security (Gate logs, Visitors)\n- Settings: /dashboard/[slug]/settings (Roles, Audit Logs)",
        category: "navigation"
    },
    {
        title: "Help Desk Features",
        content: "Residents can raise tickets for Maintenance, Security, or General queries. Features: Priority tagging (Low to Emergency), SLA tracking (Auto-deadlines), Staff Work Panel (Staff Queue), and Feedback ratings.",
        category: "feature"
    },
    {
        title: "Security Gate Features",
        content: "The Gatekeeper module allows residents to create 'Visitor Passes' (QR Codes). Guards use the scanner to log entries. Admins can view real-time 'Gate Logs'.",
        category: "feature"
    },
    {
        title: "Roles & Permissions",
        content: "Admins manage access via the 'Role Matrix' at /settings/roles. Custom roles can be created. System roles include: Owner (Full Access), Admin (High Access), Staff (Work Queue), Resident (Basic Access), Guard (Security Only).",
        category: "feature"
    },
    {
        title: "Finance Module",
        content: "Tracks Invoices and Payments. Residents can view outstanding dues. Admins can generate recurring bills.",
        category: "feature"
    }
];

export const AVAILABLE_TOOLS = [
    {
        name: "get_ticket_status",
        description: "Get the status of a specific complaint ticket by ID or 'latest'.",
        parameters: { type: "object", properties: { ticketId: { type: "string" } } }
    },
    {
        name: "list_communities",
        description: "List all communities the user is a member of with their roles.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "create_event",
        description: "Create a new event/announcement in the community notices.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string", description: "Event name" },
                description: { type: "string", description: "Event details" }
            },
            required: ["title"]
        }
    },
    {
        name: "create_ticket",
        description: "Create a new help desk ticket for maintenance or issues.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] }
            },
            required: ["title", "description"]
        }
    },
    {
        name: "get_user_email",
        description: "Get the user's email address from their profile.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "send_chat_transcript",
        description: "Send the current chat conversation transcript to the user's email.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "get_community_events",
        description: "Get recent events and notices for the current community.",
        parameters: {
            type: "object",
            properties: {
                limit: { type: "number", description: "Number of events to return (default 5)" }
            }
        }
    },
    {
        name: "get_activity_logs",
        description: "Get the user's recent activity log in the current community.",
        parameters: {
            type: "object",
            properties: {
                limit: { type: "number", description: "Number of logs to return (default 10)" }
            }
        }
    }
];
