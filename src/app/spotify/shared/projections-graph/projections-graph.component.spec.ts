import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionsGraphComponent } from './projections-graph.component';

describe('ProjectionsGraphComponent', () => {
  let component: ProjectionsGraphComponent;
  let fixture: ComponentFixture<ProjectionsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionsGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
