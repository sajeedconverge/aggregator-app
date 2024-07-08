import { FacebookLoginProvider, GoogleSigninButtonModule, SocialAuthService, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AccountService } from '../shared/services/account.service';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { Constants } from '../../shared/Constants';
import { AuthService } from '../shared/services/auth.service';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { FormsModule } from '@angular/forms';
import { log } from 'node:console';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    SocialLoginModule,
    GoogleSigninButtonModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    FloatLabelModule,
    PasswordModule,
    DividerModule,
    ProgressBarComponent,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent implements OnInit {
  user!: SocialUser;
  loggedIn: boolean = false;
  isLoading: boolean = false;
  isUserLoggedIn = false;

  constructor(
    private socialAuthService: SocialAuthService,
    private accountService: AccountService,
    private router: Router,
    private authService: AuthService
  ) {
    //sessionStorage.clear();
   }

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((user) => {
      this.isLoading = true;
      this.user = user;
      this.loggedIn = (user != null);

      console.log(user.provider, user);
      this.accountService.externalLogin(this.user).subscribe((res) => {
        sessionStorage.setItem("social-user", JSON.stringify(this.user));
        this.authService.setAccessToken(res.payload.token);
        console.log(res);

        setTimeout(() => {
          this.isLoading = false;
          this.router.navigate(['/home']);
          Constants.isLoggedInFlag = this.loggedIn;
        }, 1500);
 
      });
    });

  }
  ngDoCheck() {
    // console.log("ngDoCheck");
     
    this.isUserLoggedIn = Constants.isLoggedInFlag || this.authService.isUserLoggedIn();
  }

  signInWithFB(): void { //Facebook Login
    this.isLoading = true;
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  externalLogin() {

  }


  signOut(): any { //for logging out
    this.socialAuthService.signOut();
    console.log('logged out');
  }


}
