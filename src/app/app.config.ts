import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authConfigInterceptor } from './user/shared/security/interceptors/auth-config.interceptor';
import { MessageService } from 'primeng/api';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import * as Sentry from '@sentry/angular';




export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authConfigInterceptor]), withFetch()),
    provideAnimationsAsync(),
    MessageService,
    {
      provide: Sentry.init,
      useFactory: () => (Sentry.init({
        dsn: ''
      }))
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '370637677190-aep1ner5nsm5c6tm64pj6fueact5rlan.apps.googleusercontent.com'
            ),
            use_fedcm_for_prompt: true
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('863952228906962')
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ]
};

