import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { UserRoutingModule } from './user-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UserRoutingModule
  ],
  providers:[
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '370637677190-aep1ner5nsm5c6tm64pj6fueact5rlan.apps.googleusercontent.com'
            )
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
})
export class UserModule { }
