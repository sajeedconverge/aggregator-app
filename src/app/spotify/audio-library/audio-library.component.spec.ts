import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioLibraryComponent } from './audio-library.component';

describe('AudioLibraryComponent', () => {
  let component: AudioLibraryComponent;
  let fixture: ComponentFixture<AudioLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
