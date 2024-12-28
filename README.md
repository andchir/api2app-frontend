# api2app-frontend

Service for quickly creating a graphical interface for an API. The created application can be made available to everyone or used via a private link.  

![Screenshot #1](https://github.com/andchir/api2app-frontend/blob/main/screenshots/001.png?raw=true "Screenshot #1")  
![Screenshot #2](https://github.com/andchir/api2app-frontend/blob/main/screenshots/002.png?raw=true "Screenshot #2")  
![Screenshot #3](https://github.com/andchir/api2app-frontend/blob/main/screenshots/003.png?raw=true "Screenshot #3")

Run in development mode:
~~~
npm start
~~~

Build for production:
~~~
./node_modules/.bin/ng build api2app-frontend --configuration=production
./node_modules/.bin/ng build miniapp --configuration=production
~~~

https://angular.io/guide/i18n-common-deploy  

Extract localization:
~~~
npm run extract-i18n
~~~

~~~
npx tailwindcss -i ./src/styles.css -o public/assets/css/styles.css
~~~
