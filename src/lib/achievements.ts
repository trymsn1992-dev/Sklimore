export interface Achievement {
    id: string;
    title: string;
    description: string;
    threshold: number; // Meters required
    iconName: "Mountain" | "Trophy" | "Rocket" | "Terminal";
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "leet",
        title: "L33t Skier",
        description: "1337 meter! Nerdenes favoritthøyde.",
        threshold: 1337,
        iconName: "Terminal"
    },
    {
        id: "galdhopiggen",
        title: "Galdhøpiggen",
        description: "2469m. Norges tak er nådd!",
        threshold: 2469,
        iconName: "Mountain"
    },
    {
        id: "montblanc",
        title: "Mont Blanc",
        description: "4810m. Europas høyeste fjell.",
        threshold: 4810,
        iconName: "Mountain"
    },
    {
        id: "everest",
        title: "Mount Everest",
        description: "8848m. Verdens høyeste punkt!",
        threshold: 8848,
        iconName: "Trophy"
    },
    {
        id: "olympus_mons",
        title: "Olympus Mons",
        description: "21 200m. Du er nå på Mars.",
        threshold: 21200,
        iconName: "Rocket"
    }
];

export function getUnlockedAchievements(meters: number): Achievement[] {
    return ACHIEVEMENTS.filter(a => meters >= a.threshold);
}

export function getNextAchievement(meters: number): Achievement | null {
    return ACHIEVEMENTS.find(a => meters < a.threshold) || null;
}
