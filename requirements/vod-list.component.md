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
- **Template Logic**: Uses `FormsModule` for `[(ngModel)]` binding on search and category picks.
- **Responsive Styling**: Uses CSS Grid for the layout, adapting from desktop to mobile views.
