# SeriesDetailsComponent

The `SeriesDetailsComponent` allows users to dive deep into a TV show to see its seasons and pick an episode to watch.

## Key Responsibilities
- **Season Selector**: Organizes episodes into seasons so users can easily find what they are looking for.
- **Episode List**: Displays all episodes available in the selected season.
- **Show Summary**: Provides a high-level overview of the series.
- **Playback**: Selecting an episode starts the video player for that specific content.

## Angular Implementation
- **Hierarchical Data**: Handles the nested structure of seasons and episodes returned by the series API.
- **Dynamic Content**: Updates the displayed episode list whenever the user switches between seasons.
- **Service Dependency**: Injects `XtreamService` to fetch show info and handle playback navigation.

## React Native Implementation
- **Season Management**: Uses `useState` to track the current `selectedSeason` and filters the `episodes` dictionary accordingly.
- **Horizontal Navigation**: Implements a horizontal `ScrollView` for the season badge selector to save vertical space.
- **Episode Listing**: Renders a vertical list of episodes as interactive cards with clear playback indicators.
- **Visual Presentation**: Features a hero-style backdrop, show metadata, and a persistent "Back" FAB for easy navigation.
- **Deep Linking**: Passes season and episode context when navigating to the full-screen player.
