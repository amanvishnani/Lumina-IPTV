# VodDetailsComponent

The `VodDetailsComponent` is a dedicated page for a single movie. It provides all the information a user would want to know before watching.

## Key Responsibilities
- **Movie Info Card**: Shows the title, plot, ratings, release date, and cast of a movie.
- **Viewing Options**: Provides a prominent "Play" button to start the movie.
- **Offline Viewing**: Includes a "Download" button to save the movie file to the user's device.
- **Smooth Navigation**: Lets users easily go back to the movie list.

## Angular Implementation
- **Route Parameters**: Uses `ActivatedRoute` to get the movie ID from the URL (`/movie/:id`).
- **Data Initialization**: Calls `xtreamService.getVodInfo()` in `ngOnInit` to fetch the specific metadata.
- **Stream URL Construction**: Dynamically builds the download/play URL using stored user credentials.
- **Download Mechanism**: Uses `window.open` as a robust way to trigger a browser-level download for the stream link.
- **UI State**: Manages `loading` and `error` properties to show appropriate spinners or messages.
