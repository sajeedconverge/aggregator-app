import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import * as Sentry from "@sentry/browser";

Sentry.init({
  //dsn: 'spotify',
  tracesSampleRate: 1.0,
  // integrations: [
  //     new BrowserTracing()  
  // ],
});



bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));




