"use strict";
function levenshteinDistance(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1));

    for (let i = 0; i <= a.length; i++) {
        for (let j = 0; j <= b.length; j++) {
            if (i === 0) {
                dp[i][j] = j;
            } else if (j === 0) {
                dp[i][j] = i;
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
            }
        }
    }

    return dp[a.length][b.length];
}

function GetClosestMatches(input, candidates, maxDistance) {
    input = input.toLowerCase();

    // Collect items with distances
    const results = candidates
        .map(candidate => {
            const target = candidate.name.toLowerCase();
            const distance = levenshteinDistance(input, target);
            return { item: candidate, distance };
        })
        .filter(r => r.distance <= maxDistance) // keep only within maxDistance
        .sort((a, b) => a.distance - b.distance); // sort by distance

    // Return only the items
    return results.map(r => r.item);
}



export { GetClosestMatches }
