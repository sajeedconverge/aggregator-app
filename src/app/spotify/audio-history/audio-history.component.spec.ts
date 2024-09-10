import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioHistoryComponent } from './audio-history.component';

describe('AudioHistoryComponent', () => {
  let component: AudioHistoryComponent;
  let fixture: ComponentFixture<AudioHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
