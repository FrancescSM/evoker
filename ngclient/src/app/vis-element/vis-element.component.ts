import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vis-element',
  templateUrl: './vis-element.component.html',
  styleUrls: ['./vis-element.component.css']
})
export class VisElementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  saveFile() {
    console.log('saveFile');
    return true;
  }

  toggleShowHide(){
    console.log('toggleShowHide');
    return true;
  }

}
