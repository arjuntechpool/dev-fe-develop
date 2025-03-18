import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

// User interface with fields that match parent component expectations
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
    'designation',
    'seat',
    'email',
    'mobile'
  ];

  user_list: User[] = [];
  selectedUser: User | null = null;
  dataSource: MatTableDataSource<User>;
  office_list: any = [];

  // Advanced search criteria
  searchCriteria = {
    department: '',
    section: '',
    seat: '',
    empName: '',
    mobile: '',
    email: ''
  };

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

  constructor(private dialogRef: MatDialogRef<SearchUserComponent>) {
    this.dataSource = new MatTableDataSource<User>([]);
  }

  ngOnInit(): void {
    this.fetch_user_list();
  }

  rowActive(index: number, user: User) {
    this.activeRowIndex = index; // Set the active row index
    this.selectedUser = user; // Store selected user
    console.log('Selected user:', this.selectedUser);
  }

  closeModal(): void {
    this.dialogRef.close({});
  }

  selectUser(): void {
    if (this.selectedUser) {
      // Map user properties to match what parent component expects
      const mappedUser = {
        user_id: this.selectedUser.user_id,
        user_name: this.selectedUser.user_name,
        user_eamil: this.selectedUser.email, // Map email to user_eamil
        user_mob: this.selectedUser.mobile,  // Map mobile to user_mob
        seat_name: this.selectedUser.seat,   // Map seat to seat_name
        seat_id: this.selectedUser.user_id.toString() // Create a seat_id
      };
      console.log('Sending user data to parent:', mappedUser);
      this.dialogRef.close(mappedUser);
    } else {
      alert('Please select a user before clicking Select.');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Since we're using HTML table and not mat-table, we need to update user_list
    this.user_list = this.dataSource.filteredData;
  }

  advancedSearch() {
    // Configure custom filter predicate to handle multiple criteria
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchTerms = JSON.parse(filter);
      return Object.keys(searchTerms).every(key => {
        if (!searchTerms[key]) return true; // Skip empty criteria

        const value = this.getPropertyByPath(data, this.getPropertyMapping(key));
        return value && value.toLowerCase().includes(searchTerms[key].toLowerCase());
      });
    };

    // Apply the filter
    this.dataSource.filter = JSON.stringify(this.searchCriteria);

    // Update the user_list for the HTML table
    this.user_list = this.dataSource.filteredData;
  }

  // Helper methods for advanced search
  getPropertyMapping(key: string): string {
    const mappings: {[key: string]: string} = {
      'department': 'designation', // Map department to designation field
      'empName': 'user_name',
      'mobile': 'mobile',
      'email': 'email',
      'seat': 'seat'
    };
    return mappings[key] || key;
  }

  getPropertyByPath(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }

  fetch_user_list() {
    // Mock data with unique IDs
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
        user_id: 2, // Changed from 1
        user_name: 'User-02', // Changed for clarity
        user_code: 'Off02',
        designation: 'designation2',
        email: 'user2@gmail.com',
        mobile: '9876543210',
        seat: 'seat02',
      },
      {
        user_id: 3, // Changed from 1
        user_name: 'User-03',
        user_code: 'Off03',
        designation: 'designation3',
        email: 'user3@gmail.com',
        mobile: '8765432109',
        seat: 'seat03',
      },
      {
        user_id: 4, // Changed from 1
        user_name: 'User-04',
        user_code: 'Off04',
        designation: 'designation4',
        email: 'user4@gmail.com',
        mobile: '7654321098',
        seat: 'seat04',
      },
    ];

    this.dataSource = new MatTableDataSource(this.user_list);
  }
}
