import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StravaConsentComponent } from './strava-consent.component';

describe('StravaConsentComponent', () => {
  let component: StravaConsentComponent;
  let fixture: ComponentFixture<StravaConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StravaConsentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StravaConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
