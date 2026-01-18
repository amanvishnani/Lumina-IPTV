# LoginComponent

The `LoginComponent` is the first screen users see. it allows them to enter their IPTV provider's URL, username, and password to gain access to their content.

## Key Responsibilities
- **Entry Gate**: Provides a simple form for users to enter their credentials.
- **Login Check**: Sends the entered details to the server to verify if they are correct.
- **Navigation**: Automatically moves the user to the Dashboard once they are logged in.
- **Helpful Feedback**: Shows clear error messages if the username/password is wrong or if there's a connection problem.

## Angular Implementation
- **Reactive Forms**: Uses `FormBuilder` and `ReactiveFormsModule` for form management and validation.
- **Validation**: Enforces `Validators.required` on all input fields.
- **HTTP Interaction**: Injects `XtreamService` to perform the login request.
- **Routing**: Uses `Router` to navigate to `['/dashboard']` on successful authentication (`auth === 1`).
- **State Handling**: Manages local `loading` and `error` flags to update the UI during the login process.
