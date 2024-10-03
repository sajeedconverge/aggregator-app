import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackSummaryGraphComponent } from './track-summary-graph.component';

describe('TrackSummaryGraphComponent', () => {
  let component: TrackSummaryGraphComponent;
  let fixture: ComponentFixture<TrackSummaryGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackSummaryGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackSummaryGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
