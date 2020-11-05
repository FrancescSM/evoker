import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-folder-dialog',
  templateUrl: './new-folder-dialog.component.html',
  styleUrls: ['./new-folder-dialog.component.css']
})
export class NewFolderDialogComponent implements OnInit {

  folderName: string;
  constructor() { }

  ngOnInit(): void {
  }

}
