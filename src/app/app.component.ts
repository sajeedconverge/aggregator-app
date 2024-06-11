import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { Constants } from './shared/Constants';
import { CommonModule } from '@angular/common';
import { Tooltip, TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonModule,
    SidebarModule,
    ToastModule,
    CommonModule,
    TooltipModule
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

  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  ngDoCheck() {
    // console.log("ngDoCheck");
    this.isUserLoggedIn = Constants.isLoggedInFlag;
  }





  login() {

  }

  logout() {

  }



}
