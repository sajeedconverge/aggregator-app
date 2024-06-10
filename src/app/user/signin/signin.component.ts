import { FacebookLoginProvider, GoogleSigninButtonModule, SocialAuthService, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    SocialLoginModule,
    GoogleSigninButtonModule,
    ButtonModule,
    InputTextModule,
    CardModule,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent implements OnInit {
  user!: SocialUser;
  loggedIn: boolean = false;



  constructor(
    private authService: SocialAuthService
  ) { }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      console.log(user);
    });
  }

  signInWithFB(): void { //Facebook Login
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  externalLogin() {
    
  }


  signOut(): any { //for logging out
    this.authService.signOut();
    console.log('logged out');
  }


}
