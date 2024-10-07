import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-projections-graph',
  standalone: true,
  imports: [],
  templateUrl: './projections-graph.component.html',
  styleUrl: './projections-graph.component.css'
})
export class ProjectionsGraphComponent implements OnInit {
  tracks: any[] = this.config.data.tracks;


  constructor(
    public dynamicDialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    console.log(this.tracks);
  }




























  
}
