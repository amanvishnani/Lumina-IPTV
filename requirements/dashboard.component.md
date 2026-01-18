# DashboardComponent

The `DashboardComponent` is the central hub for Live TV. It lets users browse through TV channels, find specific ones, and switch between different parts of the app.

## Key Responsibilities
- **Live TV Guide**: Displays all available live TV channels.
- **Quick Search**: Lets users type a name to find a specific channel instantly.
- **Categories**: Organizes channels into groups (like Sports, News, or Movies) for easier browsing.
- **Easy Navigation**: Provides simple buttons to go to the Movies or TV Shows sections.
- **Pagination**: Breaks long lists into pages so it's easier to scroll through hundreds of channels.
- **Session Control**: Lets users log out when they are done.

## Angular Implementation
- **Lifecycle Hooks**: Uses `ngOnInit` to verify login status and trigger initial data fetching.
- **Search Logic**: Uses an RxJS `Subject` with `debounceTime(1000)` to prevent excessive filtering while typing.
- **Filtering & Pagination**: Implements client-side logic to filter the `streams` array and return a small slice (`paginatedStreams`) for the current page.
- **Template Directives**: Uses `*ngFor` for listing and `*ngIf` for conditional loaders and error states.
- **Routing**: Handles navigation to `/play`, `/movies`, and `/series`.
