# AppComponent

The `AppComponent` is the main foundation of the web application. It acts as the "shell" that holds everything else together.

## Key Responsibilities
- **App Shell**: Provides the basic structure where different pages (like Login or Dashboard) are displayed.
- **Startup**: Sets the title of the browser tab and initializes the app.

## Angular Implementation
- **Root Component**: Defined with the `app-root` selector.
- **Routing**: Imports and uses `RouterOutlet` in its template to enable page transitions.
- **Standalone Mode**: Uses `standalone: true` and specifies its own imports and styles.
