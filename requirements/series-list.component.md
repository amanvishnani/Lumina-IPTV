# SeriesListComponent

The `SeriesListComponent` lets users explore the TV show library, finding their favorite series using filters and search.

## Key Responsibilities
- **Show Catalog**: Displays all available TV series in a browseable grid.
- **Easy Find**: Provides a search bar and category filters to narrow down the selection.
- **Navigation**: Selecting a series takes the user to the details page where they can see seasons and episodes.
- **Pagination**: Manages large series libraries by splitting them into pages.

## Angular Implementation
- **Shared Logic**: Follows the same pattern as `VodListComponent` with a 1-second search debounce.
- **Data Handling**: Fetches series categories and items via `XtreamService`.
- **Filtering**: Performs client-side filtering on the `series` array.
- **Pagination**: Uses `paginatedSeries` and `totalPages` getters to manage the view state.
- **Navigation**: Uses `router.navigate` to move to `/series/:id`.
