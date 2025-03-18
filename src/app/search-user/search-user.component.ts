import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss']
})
export class SearchUserComponent implements OnInit {

  displayedColumns: string[] = ['user_name', 'user_code', 'designation', 'email'];
  dataSource:any=[];
  office_list:any=[];
  user_list:any=[];
  selectedUser: any = null; // Track selected user

  // Active class for table row when clicks
  activeRowIndex: number | null = null; // Track the active row index



  // Modal footer buttons
  modalButtons = [
    { text: 'Cancel', className: 'btn btn-outline-primary-90 xs', action: this.closeModal.bind(this) },
    { text: 'Select', className: 'btn btn-primary-90 xs', action: this.selectUser.bind(this) }
  ];



  constructor(private dialogRef: MatDialogRef<SearchUserComponent>) { }

  ngOnInit(): void {
    this.fetch_user_list();
  }


  // rowActive(index: number) {
  //   this.activeRowIndex = index; // Set the active row index
  // }
  rowActive(index: number, user: any) {
    this.activeRowIndex = index; // Set the active row index
    this.selectedUser = user; // Store selected user
  }
  closeModal(): void {
    this.dialogRef.close({});
  }
  selectUser(): void {
    if (this.selectedUser) {
      this.dialogRef.close(this.selectedUser); // Pass selected user
    } else {
      alert('Please select a user before clicking Select.');
    }
  }

  fetch_user_list(){
    this.user_list = [
      { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},
      { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},



    ];

    this.dataSource = new MatTableDataSource(this.user_list)

}

}
