# IptvPoc

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Environment Variables

This project uses `@ngx-env/builder` to support environment variables from a `.env` file.

1.  Create a `.env` file in the `angular/` directory (you can use `.env.sample` as a template).
2.  Add your IPTV credentials:
    ```env
    NG_APP_DEFAULT_URL=http://your-iptv-url:port
    NG_APP_DEFAULT_USERNAME=your-username
    NG_APP_DEFAULT_PASSWORD=your-password
    ```

The application will use these values as defaults in the login form.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
