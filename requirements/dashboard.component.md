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

## React Native Implementation
- **Layout**: Uses `SafeAreaView` and `View` with `flexDirection: 'row'` for the header and navigation controls.
- **Listing**: Implements `FlatList` for efficient vertical scrolling of channels.
- **Category Filter**: Uses a horizontal scrolling `FlatList` to display categories as interactive chips.
- **Search**: Implements a `TextInput` that filters the local state on every change.
- **Infinite Scroll / Pagination**: Uses `FlatList`'s `onEndReached` to dynamically load more items (by increasing the visible slice) as the user scrolls down.
- **Images**: Uses the `Image` component with `source={{ uri: ... }}` and a fallback placeholder for channel icons.
- **Interaction**: Uses `TouchableOpacity` for channel selection and navigation to the player.
