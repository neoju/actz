export function getOptimizedContext(userEquipment: string | null, allExercises: any[]) {
    const equipment = (userEquipment || "").toLowerCase();

    let filteredExercises = allExercises;

    // Simple heuristic mapping
    if (equipment.includes("gym")) {
        // Full gym access, include everything
        filteredExercises = allExercises;
    } else if (equipment.includes("dumbbell")) {
        // Dumbbells + Bodyweight
        filteredExercises = allExercises.filter((e) =>
            e.tags.some((t: string) => t === "dumbbell" || t === "bodyweight"),
        );
    } else if (equipment.includes("home")) {
        // Assume home implies at least dumbbells or bands, but safe to default to bodyweight + dumbbells if standard
        // For now, let's treat "home" without "gym" as dumbbells/bodyweight
        filteredExercises = allExercises.filter((e) =>
            e.tags.some((t: string) => t === "dumbbell" || t === "bodyweight"),
        );
    } else {
        // Default to bodyweight only for safety and lowest token cost
        filteredExercises = allExercises.filter((e) =>
            e.tags.includes("bodyweight"),
        );
    }

    // Deduplicate and process
    const categories = [...new Set(filteredExercises.map((e: any) => e.category))];
    const tags = [...new Set(filteredExercises.flatMap((e: any) => e.tags))];
    const exerciseNames = filteredExercises.map((e: any) => e.name).join(", ");

    return {
        categories,
        tags,
        exerciseNames,
        count: filteredExercises.length
    };
}
