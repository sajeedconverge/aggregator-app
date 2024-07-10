import { SocialLoginModule, GoogleSigninButtonModule, FacebookLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { Constants } from '../../shared/Constants';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { StravaService } from '../../strava/shared/services/strava.service';
import { AccountService } from '../shared/services/account.service';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRegisterRequest } from '../shared/models/user-models';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user!: SocialUser;
  loggedIn: boolean = false;
  isLoading: boolean = false;
  isUserLoggedIn = false;
  registerForm!: FormGroup;
  UserRequest!: UserRegisterRequest;

  constructor(
    private socialAuthService: SocialAuthService,
    private accountService: AccountService,
    private router: Router,
    private authService: AuthService,
    private spotifyService: SpotifyService,
    private stravaService: StravaService,
    private fb: FormBuilder
  ) {
    // if (typeof window !== 'undefined' && window.sessionStorage) {
    //   sessionStorage.clear();
    // };

  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
    this.socialAuthService.authState.subscribe((user) => {
      this.isLoading = true;
      this.user = user;
      this.loggedIn = (user != null);

      console.log(user.provider, user);
      this.accountService.externalLogin(this.user).subscribe((res) => {
        //sessionStorage.setItem("social-user", JSON.stringify(this.user));
        this.authService.setAccessToken(res.payload.token);
        console.log(res);

        setTimeout(() => {
          this.isLoading = false;
          this.router.navigate(['/home']);
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

      });
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

  onSubmit() {
    if(this.registerForm.valid) {
      this.UserRequest = this.registerForm.value;
      this.accountService.register(this.UserRequest).subscribe((res) => {
        //debugger;
        //if (res) {
          
          console.log('register success', res);
          
          this.router.navigate(['/home']);
        //};
      });
    };
    
  }


  signOut(): any { //for logging out
    this.socialAuthService.signOut();
    console.log('logged out');
  }

}
