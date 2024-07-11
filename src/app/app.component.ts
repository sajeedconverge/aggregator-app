import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { Constants } from './shared/Constants';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from './shared/services/theme.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './user/shared/services/auth.service';
import { SigninComponent } from './user/signin/signin.component';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    SidebarModule,
    ToastModule,
    TooltipModule,
    InputSwitchModule,
    FormsModule,
    ReactiveFormsModule,
    SigninComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isIframe = false;
  isUserLoggedIn = false;
  private readonly _destroying$ = new Subject<void>();
  sidebarVisible: boolean = false;
  userName: string = "";

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private socialAuthService: SocialAuthService,
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  ngDoCheck() {
    // console.log("ngDoCheck");
    this.isUserLoggedIn = this.authService.isLoggedIn();

  }

  get dark() {
    return this.themeService.theme === 'dark';
  }

  set dark(enabled: boolean) {
    this.themeService.theme = enabled ? 'dark' : '';
  }

  navigateToPath(path: string) {
    this.sidebarVisible = false;
    this.router.navigate([`${path}`]);

  }

  logout() {
    this.isUserLoggedIn = false;
    this.socialAuthService.signOut(true);
    localStorage.clear();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 500);
    
  }



}
