import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyConsentComponent } from './spotify-consent.component';

describe('SpotifyConsentComponent', () => {
  let component: SpotifyConsentComponent;
  let fixture: ComponentFixture<SpotifyConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyConsentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
