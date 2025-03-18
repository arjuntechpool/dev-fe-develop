import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
// Consider creating an interface for user
interface User {
  user_id: number;
  user_name: string;
  user_code: string;
  designation: string;
  email: string;
  mobile: string;
  seat: string;
}

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss'],
})
export class SearchUserComponent implements OnInit {
  displayedColumns: string[] = [
    'user_name',
    'user_code',
    'designation',
    'email',
  ];
  // Then use it in the component
  user_list: User[] = [];
  selectedUser: User | null = null;
  dataSource: any = [];
  office_list: any = [];

  // Active class for table row when clicks
  activeRowIndex: number | null = null; // Track the active row index

  // Modal footer buttons
  modalButtons = [
    {
      text: 'Cancel',
      className: 'btn btn-outline-primary-90 xs',
      action: this.closeModal.bind(this),
    },
    {
      text: 'Select',
      className: 'btn btn-primary-90 xs',
      action: this.selectUser.bind(this),
    },
  ];

  constructor(private dialogRef: MatDialogRef<SearchUserComponent>) {}

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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  fetch_user_list() {
    this.user_list = [
      {
        user_id: 1,
        user_name: 'User-01',
        user_code: 'Off01',
        designation: 'designation1',
        email: 'mail@gmail.com',
        mobile: '1234567890',
        seat: 'seat01',
      },
      {
        user_id: 1,
        user_name: 'User-01',
        user_code: 'Off01',
        designation: 'designation1',
        email: 'mail@gmail.com',
        mobile: '1234567890',
        seat: 'seat01',
      },

      {
        user_id: 1,
        user_name: 'User-01',
        user_code: 'Off01',
        designation: 'designation1',
        email: 'mail@gmail.com',
        mobile: '1234567890',
        seat: 'seat01',
      },

      {
        user_id: 1,
        user_name: 'User-01',
        user_code: 'Off01',
        designation: 'designation1',
        email: 'mail@gmail.com',
        mobile: '1234567890',
        seat: 'seat01',
      },

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},

      // { "user_id":1,"user_name":"User-01", user_code: "Off01",designation:"designation1", email:"mail@gmail.com",mobile:"1234567890","seat":"seat01"},
    ];

    this.dataSource = new MatTableDataSource(this.user_list);
  }
}
