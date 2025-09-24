import math
import types
import pandas as pd
import alphashape
import json
from shapely.geometry import MultiPolygon, Polygon
from concave_hull import concave_hull

# Read points from CSV
df = pd.read_csv("./points.csv")

# Group points by faction
factions = df.groupby("Faction")

# Compute concave hull for each faction

# for faction, group in factions:
#     # if faction == "Neutral":
#     # continue
#     points = list(zip(group["X"], group["Y"]))
#     points = [(float(x), float(y)) for (x, y) in points]
#     print(f"Faction: {faction}")

#     # Skip if fewer than 3 points (can't form a polygon)
#     if len(points) < 3:
#         hulls[faction] = [[x, y] for x, y in points]
#         continue

#     # Compute concave hull (alpha shape)
#     # Adjust alpha: smaller values create more concavities, larger values approach convex hull
#     # alpha = 5.0  # Tune this based on your data scale (e.g., try 100, 1000, 10000)
#     # alpha = alphashape.optimizealpha(points)
#     alpha_shape = alphashape.alphashape(points, 0)

#     # Handle single polygon or MultiPolygon (for holes)
#     if isinstance(alpha_shape, MultiPolygon):
#         # Take the largest polygon (or handle holes explicitly if needed)
#         polygons = list(alpha_shape.geoms)
#         alpha_shape = max(polygons, key=lambda p: p.area)

#     # Extract exterior coordinates
#     if alpha_shape.is_empty:
#         raise Exception("EMPTY")
#     else:
#         # Get exterior points (counter-clockwise)
#         coords = list(alpha_shape.exterior.coords)[:-1]  # Exclude last point (repeated)
#         hulls[faction] = [{"x": x, "y": y} for x, y in coords]

hulls = {}

for faction, group in factions:
    points = list(zip(group["X"], group["Y"]))
    points = [(float(x), float(y)) for (x, y) in points]
    print(f"Faction: {faction}")
    if faction == "Neutral":
        continue

    # Skip if fewer than 3 points (can't form a polygon)
    if len(points) < 3:
        hulls[faction] = [[x, y] for x, y in points]
        continue

    # Compute concave hull
    # Adjust concavity parameter: smaller values create more concavities
    try:
        hull_points = concave_hull(
            points, concavity=1
        )  # Tune concavity based on data scale
        alpha_shape = Polygon(hull_points)  # Convert hull points to Shapely Polygon
    except Exception as e:
        print(f"Error computing concave hull for {faction}: {e}")
        hulls[faction] = [[x, y] for x, y in points]
        continue

    # Apply buffer to expand the hull outward, ensuring points are encapsulated
    # Tune buffer_distance based on your coordinate scale (e.g., 10.0, 50.0, 100.0)
    buffer_distance = 20.0  # Adjust this to control how far the boundary extends
    alpha_shape = alpha_shape.buffer(buffer_distance)

    # Simplify the shape to reduce the number of points
    # Tune tolerance based on your coordinate scale (e.g., 1.0, 5.0, 10.0 for meters; 0.001 for degrees)
    # Higher tolerance = fewer points, simpler shape
    tolerance = 5.0  # Adjust this to reduce points while preserving shape
    alpha_shape = alpha_shape.simplify(tolerance, preserve_topology=True)

    # Handle single polygon or MultiPolygon (for holes)
    if isinstance(alpha_shape, MultiPolygon):
        # Take the largest polygon (or handle holes explicitly if needed)
        polygons = list(alpha_shape.geoms)
        alpha_shape = max(polygons, key=lambda p: p.area)

    # Extract exterior coordinates
    if alpha_shape.is_empty:
        raise Exception("EMPTY")
    else:
        # Get exterior points (counter-clockwise)
        coords = list(alpha_shape.exterior.coords)[:-1]  # Exclude last point (repeated)
        hulls[faction] = [{"x": x, "y": y} for x, y in coords]


# Save to JSON
with open("./Resources/Json/bounds_concave.json", "w") as f:
    json.dump(hulls, f, indent=2)

print("Wrote concave hulls to ./bounds_concave.json")
