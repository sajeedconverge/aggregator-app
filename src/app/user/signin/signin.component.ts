import { FacebookLoginProvider, GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthService, SocialAuthServiceConfig, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';
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
import { CommonModule } from '@angular/common';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { StravaService } from '../../strava/shared/services/strava.service';
import { RegisterComponent } from "../register/register.component";
import { UserModule } from '../user.module';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserLoginRequest } from '../shared/models/user-models';

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
    RegisterComponent,
    ReactiveFormsModule
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',

})
export class SigninComponent implements OnInit {
  user!: SocialUser;
  //loggedIn: boolean = false;
  isLoading: boolean = false;
  isUserLoggedIn = false;
  signinForm!: FormGroup;
  showSignUp: boolean = false;
  UserRequest!: UserLoginRequest;



  constructor(
    private socialAuthService: SocialAuthService,
    private accountService: AccountService,
    private router: Router,
    private authService: AuthService,
    private spotifyService: SpotifyService,
    private stravaService: StravaService,
    private fb: FormBuilder
  ) {

  }

  ngAfterViewInit(): void {
    if (typeof document !== 'undefined') {
      const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll<HTMLAnchorElement>('a');
      const forms: HTMLElement | null = document.querySelector<HTMLElement>('.signin_mainpage');
      if (forms) {
        links.forEach(link => {
          link.addEventListener("click", (e: MouseEvent) => {
            e.preventDefault(); // Preventing form submit
            forms.classList.toggle("show-signup");
          });
        });
      }
    }
  }

  ngOnInit(): void {

    this.signinForm = this.fb.group({
      email: new FormControl(),
      password: new FormControl()
    })

    this.socialAuthService.authState.subscribe((user) => {
     // debugger;
      if (user) {
        this.isLoading = true;
        this.user = user;
        //this.loggedIn = (user != null);

        console.log(user.provider, user);
        this.accountService.externalLogin(this.user).subscribe((res) => {
          //initial login process to store user data
          this.authService.setAccessToken(res.payload.token);
          console.log(res);

          setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/home']);
            //Constants.isLoggedInFlag = this.loggedIn;
            //to set the spotify settings from api to client app
            this.spotifyService.getSpotifyData().subscribe((res) => {
              if (res.statusCode === 200) {
                Constants.spotifySettings = res.payload;
              }
            });
            this.stravaService.getStravaData().subscribe((res) => {
              if (res.statusCode === 200) {
                Constants.stravaSettings = res.payload;
              }
            });
          }, 1500);
          this.signOut();
        });
      };
    });

  }
  ngDoCheck() {
    // console.log("ngDoCheck");

    this.isUserLoggedIn = this.authService.isLoggedIn();
  }

  signInWithFB(): void { //Facebook Login
    this.isLoading = true;
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }




  signOut(): any { //for logging out
    this.socialAuthService.signOut();
    console.log('logged out');
  }

  onSubmit() {
    if (this.signinForm.valid) {
      this.UserRequest = this.signinForm.value;
      this.accountService.login(this.UserRequest).subscribe((res) => {
        if (res.statusCode === 200) {

          console.log('login success', res);

          //initial login process to store user data
          this.authService.setAccessToken(res.payload.token);
          console.log(res);

          setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/home']);
            //Constants.isLoggedInFlag = this.loggedIn;
            //to set the spotify settings from api to client app
            this.spotifyService.getSpotifyData().subscribe((res) => {
              if (res.statusCode === 200) {
                Constants.spotifySettings = res.payload;
              }
            });
            this.stravaService.getStravaData().subscribe((res) => {
              if (res.statusCode === 200) {
                Constants.stravaSettings = res.payload;
              }
            });
          }, 1500);

        };
      });
    };

  }

}
