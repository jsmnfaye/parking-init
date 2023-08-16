# ParkingSystem

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.6. 

The website features a simple parking lot map where you can create vehicles (small, medium, and large) and the system will automatically pick the nearest appropriate parking slot. There are three entrances (A, B, C), the default being entrance A, but this can be changed by pressing on any of the entrances on the parking lot map. 

You can click on a parking slot to unpark a vehicle, after which the parking charge will be shown on the website as well. There is a flat rate of 40PHP for the first three hours, and every hour past that will incur an overstaying fee which depends on the parking slot size. Every 24 hours of overstay will incur 5,000PHP. Various parking slot times can be simulated by setting a clock out date and time, and choosing a previously parked vehicle.

This project does not use any database for simplicity; thus, refreshing the page will only restart the web app. 

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
