# PlayerComponent

The `PlayerComponent` is the actual video screen. It is designed to be very simple, putting the focus entirely on the video content.

## Key Responsibilities
- **Video Watching**: Provides a clean screen for watching TV, movies, or shows.
- **Playback Status**: Shows if there is a problem playing the video and offers helpful advice.
- **Simple Controls**: Includes a "Back" button to return to the previous screen.

## Angular Implementation
- **Third-Party Integration**: Initializes and manages a `video.js` player instance.
- **DOM Access**: Uses `@ViewChild` and `ElementRef` to safely interact with the `<video>` element.
- **URL Building**: Injects `XtreamService` to get user credentials and construct the final stream URL based on `streamType`.
- **Lifecycle Management**: Ensures the player is properly destroyed on `ngOnDestroy` to prevent memory leaks.
- **Error Handling**: Captures playback errors and displays a fallback UI with the direct stream link.
