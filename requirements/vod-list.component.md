# VodListComponent

The `VodListComponent` is where users can find and browse through the entire movie library. It provides tools to filter, search, and navigate large collections of films.

## Key Responsibilities
- **Movie Catalog**: Displays movies in an attractive grid of posters.
- **Genre Filtering**: Lets users select specific categories (like Action, Comedy, etc.) to see relevant movies.
- **Search Tool**: A search bar to find a movie by its title quickly.
- **Page Navigation**: Handles large numbers of movies by splitting them into manageable pages.
- **Selection**: Selecting a movie takes the user to that movie's specific details page.

## Angular Implementation
- **Search Debounce**: Implements a 1-second debounce using RxJS `Subject` and `debounceTime`.
- **Client-Side Slicing**: Calculates `paginatedStreams` based on `currentPage` and `pageSize` (20 items).
- **Service Integration**: Injects `XtreamService` to fetch VOD categories and streams.

## React Native Implementation
- **Layout Strategy**: Uses `FlatList` with `numColumns={3}` to create a responsive grid of movie posters.
- **Dynamic Sizing**: Calculates item width based on the device's screen width using the `Dimensions` API for a consistent 3-column look.
- **Loading Pattern**: Uses conditional rendering to show a `centerLoader` during the initial fetch and infinite scroll (via `onEndReached`) for large libraries.
- **Image Optimization**: Utilizes the `Image` component with `resizeMode="cover"` and fixed aspect ratios (1.5 for posters) to preserve the visual grid.
- **Navigation Flow**: Passes the `streamId` as a route parameter when navigating to the `VodDetails` screen.
