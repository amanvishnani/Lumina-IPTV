# SeriesDetailsComponent

The `SeriesDetailsComponent` allows users to dive deep into a TV show to see its seasons and pick an episode to watch.

## Key Responsibilities
- **Season Selector**: Organizes episodes into seasons so users can easily find what they are looking for.
- **Episode List**: Displays all episodes available in the selected season.
- **Show Summary**: Provides a high-level overview of the series.
- **Playback**: Selecting an episode starts the video player for that specific content.

## Angular Implementation
- **Nested Data**: Handles the `XtreamSeriesInfo` structure which contains a dictionary of episodes grouped by season number.
- **State Management**: Tracks `selectedSeason` and updates the displayed `episodes` array automatically.
- **Route Parameters**: Retrieves the series ID from the route to fetch the correct data.
- **Navigation**: Links directly to the player with the specific episode ID and file type.
