import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDetailChartComponent } from './activity-detail-chart.component';

describe('ActivityDetailChartComponent', () => {
  let component: ActivityDetailChartComponent;
  let fixture: ComponentFixture<ActivityDetailChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityDetailChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDetailChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
