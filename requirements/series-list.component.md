# SeriesListComponent

The `SeriesListComponent` lets users explore the TV show library, finding their favorite series using filters and search.

## Key Responsibilities
- **Show Catalog**: Displays all available TV series in a browseable grid.
- **Easy Find**: Provides a search bar and category filters to narrow down the selection.
- **Navigation**: Selecting a series takes the user to the details page where they can see seasons and episodes.
- **Pagination**: Manages large series libraries by splitting them into pages.

## Angular Implementation
- **Data Lifecycle**: Synchronizes series categories and lists using RxJS pipelines.
- **Client-Side Search**: Implements a debounced search logic similar to the VOD component to ensure smooth performance with large lists.
- **Table View**: Uses a standard HTML table or grid to display show titles and categories.

## React Native Implementation
- **Grid Layout**: Utilizes `FlatList` with `numColumns={3}` for a visually rich poster grid, consistent with the `Movies` view.
- **Visual Sizing**: Uses `Dimensions` to calculate exact item widths, ensuring the grid fills the screen on all device sizes.
- **Poster Rendering**: Displays show covers using the `Image` component with fixed aspect ratios to maintain grid alignment.
- **Interactive Browsing**: Implements horizontal category tabs and a search input for quick discovery.
- **Navigation Flow**: Seamlessly transitions to the detailed `SeriesDetails` view upon selecting a show.
