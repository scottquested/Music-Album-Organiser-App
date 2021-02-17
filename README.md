# Music Album Organiser

A music album organiser using Vanilla JavaScript, SCSS and HTML. [Webpack](https://webpack.js.org/) and [Babel](https://babeljs.io/) for compiling source code. [Bootstrap](https://getbootstrap.com/) and [fontawesome](https://fontawesome.com/v4.7.0/) used for quicker prototyping.

This was based on a scenario where a user needed a lightweight web app to store and search their album collection.

The albums needed to be editable, and the Artist name would need to be updated globally if the user decided to change it. A search field was also needed that would filter the albums as the user typed.

## Setup
1. Clone the repo
2. cd into the new directory
3. Run `npm install` to install dependencies

Bootstrap is already include in the project. To update the SCSS, there is one override file located in `src/scss/main.scss`. To switch between a light and dark te, update the variable `$dark: true` at the top of the `main.scss`.

## Development
The development setup has a built-in dev server that will update as you make a change. Run the below command and navigate in your browser to `localhost:3200`.
```
run npm build:dev
```

## Production
When you are ready to build for production run
```
npm run build
```

## Demo
You can view the working example [here](https://scottquested.github.io/Music-Album-Organiser-App/)

## Next steps
The aim is to extend this app to have more functionality.

The app doesn’t use a database so the data only persists within the browser. Using a service like firebase and/or the browsers built in indexdb for offline usage

The light/dark theme switch could be extended so that the user could toggle the theme they prefer. Currently this is only at the developer level when the build is run.

Add some orderby options so the user can order by release date, alphabetically on Album & Artist and by condition.
