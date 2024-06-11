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

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    SocialLoginModule,
    GoogleSigninButtonModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    FloatLabelModule,
    PasswordModule,
    DividerModule
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent implements OnInit {
  user!: SocialUser;
  loggedIn: boolean = false;



  constructor(
    private socialAuthService: SocialAuthService,
    private accountService: AccountService,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);

      console.log("google", user);
      this.accountService.externalLogin(this.user).subscribe((res) => {
        sessionStorage.setItem("social-user", JSON.stringify(this.user));
        console.log(res);
        this.router.navigate(['/home']);
        Constants.isLoggedInFlag = this.loggedIn;
      });
    });
  }

  signInWithFB(): void { //Facebook Login
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
    // .then((user) => {
    //   debugger;
    //   this.user = user;
    //   console.log("facebook", this.user); // For debugging purposes
    //   this.accountService.externalLogin(this.user).subscribe((res) => {
    //     console.log(res);
    //     this.router.navigate(['/home']);
    //     this.loggedIn = (user != null);
    //     Constants.isLoggedInFlag = this.loggedIn;
    //   });
    // }).catch((err) => {
    //   console.error(err);
    // });
  }

  externalLogin() {

  }


  signOut(): any { //for logging out
    this.socialAuthService.signOut();
    console.log('logged out');
  }


}
