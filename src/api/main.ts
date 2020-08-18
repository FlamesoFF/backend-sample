import App from './app';
import AppExternal from './app.external';


process.on('uncaughtException', error => {
    console.error(error);
    process.exit(1);
});


App.run();
AppExternal.run();