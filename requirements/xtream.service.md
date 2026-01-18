# XtreamService

The `XtreamService` acts as the bridge between the application and the IPTV provider's content library. It manages the connection and retrieves all the information needed to show TV channels, movies, and shows.

## Key Responsibilities
- **Connection Management**: Handles logging into the IPTV provider and remembering the user's details.
- **Content Retrieval**: Fetches the list of available categories and items for Live TV, Movies, and TV Shows.
- **Detailed Information**: Gathers specific details like movie plots, actors, and episode lists when requested.
- **Link Preparation**: Prepares the direct video links so they can be played or downloaded.

## Angular Implementation
- **Dependency Injection**: Registered as a root provider using `@Injectable({ providedIn: 'root' })`.
- **HTTP Client**: Uses Angular's `HttpClient` to make RESTful API calls.
- **Reactive Programming**: Returns `Observable` streams for all data fetching operations.
- **State Management**: Uses `localStorage` to persist `XtreamCredentials`.

## React Native Implementation
- **Singleton Pattern**: Implemented as a static `getInstance()` class.
- **HTTP Client**: Uses `axios` for standard Promise-based API requests.
- **Asynchronous Logic**: Uses `async/await` for all operations.
- **State Management**: Uses `@react-native-async-storage/async-storage` for persistent credential storage.
