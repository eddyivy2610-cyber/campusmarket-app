export type SectionId =
    | "profile"
    | "business"
    | "payment"
    | "security"
    | "preferences"
    | "help"
    | "account-status"
    | "logout"
    | "switch-account";

export const SETTINGS_SECTIONS: { id: SectionId; label: string; group: string }[] = [
    { id: "profile", label: "My Profile", group: "Profile" },
    { id: "business", label: "Business", group: "Profile" },
    { id: "payment", label: "My Payment Options", group: "Profile" },
    { id: "security", label: "Security Settings", group: "Account" },
    { id: "preferences", label: "Preferences", group: "Account" },
    { id: "account-status", label: "Deactivation & Deletion", group: "Account" },
    { id: "help", label: "Help & Support", group: "Support" },
    { id: "logout", label: "Log Out", group: "Sign Out" },
    { id: "switch-account", label: "Switch Account", group: "Sign Out" },
];

export function groupSettingsSections() {
    return SETTINGS_SECTIONS.reduce<Record<string, { id: SectionId; label: string }[]>>((acc, item) => {
        acc[item.group] = acc[item.group] || [];
        acc[item.group].push({ id: item.id, label: item.label });
        return acc;
    }, {});
}

