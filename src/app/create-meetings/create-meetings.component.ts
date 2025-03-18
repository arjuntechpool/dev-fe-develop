import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServiceService } from '../services/service.service';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { SearchUserComponent } from '../search-user/search-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';

// Create an interface file for your models
export interface Meeting {
  meeting_id?: number;
  meeting_code: string;
  meeting_name: string;
  meeting_name_ln?: string;
  active?: number;
  office_id: number;
  child?: MeetingChild[];
}

export interface MeetingChild {
  child_id?: number;
  meeting_id: number;
  child_name: string;
  active?: number;
}

@Component({
  selector: 'app-create-meetings',
  templateUrl: './create-meetings.component.html',
  styleUrls: ['./create-meetings.component.scss'],
})
export class CreateMeetingsComponent implements OnInit, AfterViewInit {
  @Output() expandToggled = new EventEmitter<void>();
  isExpanded = false;
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.expandToggled.emit();
  }
  meetings: any[] = [];
  meetingChildren: any[] = [];
  meetingUsers: any[] = []; // Store users for current meeting
  officeId: number = 1;

  // Form model to store selected values
  selectedMeetings = {
    meeting_id: null,
    meeting_code: '',
    meeting_name: '',
    meeting_name_ln: '',
  };

  // Variable to track whether the form is in edit mode
  isEditable: boolean = false;
  is_loading: boolean = false; // handle loader
  // Track whether the form is in Add New mode or Edit mode
  isAddMode: boolean = false;
  meetings_data: any = [];
  displayedColumns: string[] = [
    'slNo',
    'meeting_code',
    'meeting_name',
    'status',
    'select',
    'delete',
  ];
  // Added this for the users table
  displayedColumnsUsers: string[] = [
    'slNo',
    'seat_name',
    'user_name',
    'email',
    'mobile',
    'delete',
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  userDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]); // Renamed from dataSource1
  selectedRow: any;
  meeting_id: any;
  deactive: any; // to activate/deactivate meeting
  bilingual: any; // for handle the local languages
  language: any; // check the bilingual whether true/false
  showError: boolean = false; // for handle the validation error message
  msg: string = ''; // to store validation messages

  // Active class for table row when clicks
  activeRowIndex: number | null = null; // Track the active row index

  selected_user = {
    seat_name: '',
    seat_id: '',
    user_name: '',
    user_email: '', // Fixed typo
    user_mob: '',
    user_id: '',
  };
  flg_owner: boolean = false;
  dataSource1: MatTableDataSource<any> = new MatTableDataSource<any>([]); // Keep for backward compatibility

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('userPaginator') userPaginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private commonsvr: ServiceService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.language = environment.lang;
    console.log(this.language);
    this.bilingual = environment.bilingual;
    console.log(this.bilingual);
    this.fetch_meetings(); // to fetch all meetings

    // Initialize datasources
    this.dataSource = new MatTableDataSource<any>([]);
    this.userDataSource = new MatTableDataSource<any>([]);
    this.dataSource1 = new MatTableDataSource<any>([]); // Keep for backward compatibility
  }

  ngAfterViewInit() {
    // Use setTimeout to ensure view is fully initialized
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

      if (this.userPaginator) {
        this.userDataSource.paginator = this.userPaginator;
      }
    });
  }

  // Handle "Add New" button click
  addNewMeeting() {
    this.meeting_id = null; // Reset to save new meeting
    this.activeRowIndex = null;
    this.isEditable = false;
    this.isAddMode = true; // Set to Add New mode
    this.showError = false; // to hide error msg
    this.deactive = false;
    // Clear the form fields for adding a new meeting
    this.selectedMeetings = {
      meeting_id: null,
      meeting_code: '',
      meeting_name: '',
      meeting_name_ln: '',
    };

    // Clear users
    this.meetingUsers = [];
    this.userDataSource.data = [];
    this.dataSource1.data = []; // Keep for backward compatibility

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Handle "Edit" button click
  editMeeting() {
    this.isEditable = true;
    this.isAddMode = false; // Set to Edit mode
    this.saveMeeting();
  }

  // Handle "Cancel" button click
  cancelEdit() {
    this.isEditable = false;
    this.isAddMode = false;
    this.meeting_id = null;

    if (this.paginator) {
      this.paginator.firstPage();
    }

    // Clear form
    this.selectedMeetings = {
      meeting_id: null,
      meeting_code: '',
      meeting_name: '',
      meeting_name_ln: '',
    };

    // Clear users
    this.meetingUsers = [];
    this.userDataSource.data = [];
    this.dataSource1.data = []; // Keep for backward compatibility

    this.showError = false;
  }

  // check if all data entry are valid
  validate_meeting() {
    // Clear error messages before validation
    this.msg = '';
    this.showError = false;

    // Check if Meeting Name is empty or undefined
    if (
      this.selectedMeetings.meeting_name == '' ||
      this.selectedMeetings.meeting_name.trim().length === 0
    ) {
      this.msg = 'Enter Meeting Name!';
      this.showError = true;
      return false;
    }

    // If all checks pass
    return true;
  }

  // In fetch_meetings() method:
  fetch_meetings() {
    this.is_loading = true;
    this.commonsvr.getMeetings(this.officeId).subscribe(
      (res: any) => {
        console.log('Meetings data:', res);
        this.meetings_data = res;
        this.dataSource.data = this.meetings_data; // Ensure data is set properly
        this.is_loading = false;

        // Set paginator after data is loaded
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      (error) => {
        console.error('Error fetching meetings', error);
        this.is_loading = false;
        this.openCustomSnackbar('error', 'Failed to fetch meetings');
      }
    );
  }

  // In fetchMeetingChildren() method:
  fetchMeetingChildren(meetingId: number): void {
    this.commonsvr.getMeetingChild(meetingId).subscribe(
      (data: any) => {
        this.meetingChildren = data || [];
      },
      (error) => {
        console.error('Error fetching meeting children', error);
        this.openCustomSnackbar('error', 'Failed to fetch meeting details');
      }
    );
  }

  // Method for fetching users - can be implemented when API is ready
  fetchMeetingUsers(meetingId: number): void {
    // This would call your API to get users for a meeting
    // For now, we'll just clear the users list
    this.meetingUsers = [];
    this.userDataSource.data = [];
    this.dataSource1.data = []; // Keep for backward compatibility
  }

  saveMeeting() {
    if (!this.validate_meeting()) {
      console.log(this.msg);
      return;
    }

    // Collect users from the userDataSource
    const users = this.userDataSource.data || [];

    const meetingData = {
      meeting_id: this.meeting_id, // Use existing ID for updates
      meeting_name: this.selectedMeetings.meeting_name,
      meeting_code: this.selectedMeetings.meeting_code,
      office_id: this.officeId,
      active: this.deactive == true ? 9 : 1,
      users: users, // Include users list
      child: this.meetingChildren,
    };

    this.is_loading = true;
    this.commonsvr.saveMeeting(meetingData).subscribe(
      (response: any) => {
        console.log('Meeting saved successfully', response);
        if (response.data) {
          this.openCustomSnackbar('success', 'Saved Successfully');
          this.meeting_id = response.data.meeting_id;
        } else {
          this.openCustomSnackbar('error', 'Failed to save');
        }

        if (this.meeting_id) {
          this.isEditable = true;
        }
        this.fetch_meetings();
        this.is_loading = false;
        this.isAddMode = false;
      },
      (error) => {
        console.error('Error saving meeting', error);
        this.openCustomSnackbar('error', 'Failed to save: ' + error.message);
        this.is_loading = false;
      }
    );
  }

  onMeetingSelect(meetingId: number): void {
    this.fetchMeetingChildren(meetingId);
    this.fetchMeetingUsers(meetingId);
  }

  // to get data from table to edit meeting
  onRowClick(e: any, index: number): void {
    console.log('Selected meeting row:', e);
    this.activeRowIndex = index;
    this.meeting_id = e.meeting_id;
    this.deactive = e.active == 9 ? true : false;
    this.selectedMeetings = {
      meeting_id: e.meeting_id,
      meeting_code: e.meeting_code || '',
      meeting_name: e.meeting_name || '',
      meeting_name_ln: e.meeting_name_ln || '',
    };

    // Fetch users for this meeting if needed
    if (e.meeting_id) {
      this.fetchMeetingUsers(e.meeting_id);
    }

    this.showError = false;
    this.isEditable = true; // The form starts in view mode
    this.isAddMode = false; // Disable Add Mode
  }

  // Add removeUser method for the users table
  removeUser(index: number): void {
    console.log('Removing user at index:', index);
    if (index >= 0 && index < this.userDataSource.data.length) {
      const updatedUsers = [...this.userDataSource.data];
      updatedUsers.splice(index, 1);
      this.userDataSource.data = updatedUsers;
      this.dataSource1.data = updatedUsers; // Keep for backward compatibility
    }
  }

  // apply filter based on search box entry
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Success toast
  openCustomSnackbar(type: string, msg: string) {
    const cssClass = type === 'success' ? 'success-snackbar' : 'error-snackbar';
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: [cssClass],
    });
  }

  // Add the navigate method needed for select button
  navigate(row: any) {
    console.log('Navigate called with:', row);
    // Implement navigation logic if needed
  }

  // clear error message
  clear_msg() {
    this.showError = false;
  }

  clear_err() {
    this.showError = false;
    this.msg = '';
  }

  restrictAllEntry(e: any) {
    // Implement input validation/restriction logic
    const pattern = /[0-9a-zA-Z]/;
    const inputChar = String.fromCharCode(e.charCode);
    if (!pattern.test(inputChar)) {
      e.preventDefault();
    }
  }

  add_user_tolist() {
    console.log('Adding user to list:', this.selected_user);

    // Validate user selection
    if (!this.selected_user || !this.selected_user.user_id) {
      this.openCustomSnackbar('error', 'Please select a user first.');
      return;
    }

    // Prepare user data for the table
    const userToAdd = {
      seat_name: this.selected_user.seat_name,
      user_name: this.selected_user.user_name,
      email: this.selected_user.user_email, // Fixed typo
      mobile: this.selected_user.user_mob,
      is_owner: this.flg_owner,
    };

    // Get current data
    const currentData = this.userDataSource.data || [];

    // Check for duplicate
    const userExists = currentData.some(
      (user) => user.user_name === userToAdd.user_name
    );

    if (userExists) {
      this.openCustomSnackbar('error', 'User already added.');
      return;
    }

    // Add new user
    const updatedUsers = [...currentData, userToAdd];
    this.userDataSource.data = updatedUsers;
    this.dataSource1.data = updatedUsers; // Keep for backward compatibility

    // Reset selection
    this.clear_user_details();

    console.log('Updated user data:', this.userDataSource.data);
  }

  clear_user_details() {
    this.selected_user = {
      seat_name: '',
      seat_id: '',
      user_name: '',
      user_email: '', // Fixed typo
      user_mob: '',
      user_id: '',
    };
    this.flg_owner = false;
  }

  openUserSearch() {
    var dialogRef = this.dialog.open(SearchUserComponent, {
      width: '1130px',
    });

    dialogRef?.afterClosed().subscribe((data: any) => {
      console.log('User selected from dialog:', data); // Debug log

      if (!data || !data.user_id) {
        this.openCustomSnackbar('error', 'No user selected.');
        return;
      }

      this.selected_user = data;
      this.flg_owner = false; // Reset owner flag - let user decide

      console.log('Selected user stored:', this.selected_user); // Debug log
    });
  }
}
