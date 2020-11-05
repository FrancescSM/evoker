import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.css']
})
export class RenameDialogComponent implements OnInit {

  folderName: string;
  constructor() { }

  ngOnInit(): void {
  }

}
